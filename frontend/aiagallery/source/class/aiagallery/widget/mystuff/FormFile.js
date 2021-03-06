/**
 * Copyright (c) 2012 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.mystuff.FormFile",
{
  extend    : qx.ui.container.Composite,
  implement :
  [
    qx.ui.form.IForm,
    qx.ui.form.IStringForm
  ],
  include   : 
  [
    qx.ui.form.MForm
  ],

  construct : function(label, fieldName)
  {
    var             layout;

    // Save the label and field name. The button child control will need them
    this.label = label;
    this.fieldName = fieldName;

    layout = new qx.ui.layout.VBox(10);
    this.base(arguments, layout);
    
    // Create the child controls
    this.getChildControl("button");
    this.getChildControl("filename");
    
    // Listen for changes to the 'required' property
    this.addListener("changeRequired", this._onChangeRequired);
  },

  properties :
  {
    appearance :
    {
      refine   : true,
      init     : "formimage"
    },

    value :
    {
      check    : "String",
      apply    : "_applyValue",
      nullable : false,
      init     : null,
      event    : "changeValue"
    },
    
    content :
    {
      check    : "String",
      init     : null,
      event    : "changeContent"
    }
  },

  events :
  {
    /** Fired when the value was modified */
    "changeValue" : "qx.event.type.Data",
    
    /** Fired when a filename selection is made */
    "changeFileName" : "qx.event.type.Data"
  },

  members :
  {
    // property apply function
    _applyValue : function(value, old)
    {
      this.getChildControl("filename").setValue(value);
    },

    // property apply function
    _applyTabIndex : function(value, old)
    {
      this.getChildControl("button").setTabIndex(value);
    },

    /** Called when the 'required' property changes value */
    _onChangeRequired : function(e)
    {
      var required;
        
      // Determine the string to append. (None, if not required)
      required = (e.getData() ? " <span style='color:red'>*</span> " : "");

      // Change the label to add or remove the red asterisk
      this.getChildControl("button").setLabel(this.label + required);
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var             control;

      switch(id)
      {
      case "button":
        // Select file
        control = new uploadwidget.UploadButton(this.fieldName, this.label);
        control.setRich(true);
        this._add(control);
        
        // We access this a lot, so make it a member variable
        this.uploadButton = control;

        // When this button gets a changeFileName event, pass it along
        control.addListener(
          "changeFileName",
          function(e)
          {
            this.retrieveFile();
          },
          this);
        break;

      case "filename":
        control = new qx.ui.basic.Label();
        control.set(
          {
            focusable : false,
            alignX    : "center"
          });
        this._add(control, { flex : 1 });
        break;
      }

      return control || this.base(arguments, id);
    },
    
    /**
     * Begin retrieving a selected file using a FileReader object.
     */
    retrieveFile : function()
    {
      var             uploadElement;
      var             selection;
      var             fileSize;
      var             message;
      
      try
      {
        this.uploadReader = new qx.bom.FileReader();
      }
      catch(e)
      {
        this.uploadReader = null;

        message =
          "Your browser does not support the required functionality. " +
          "Please use a recent version of Chrome or Firefox.";

        alert(message);
        return;
      }

      // Determine the size of the file requested for upload
      fileSize = this.uploadButton.getFileSize();

      // Size check
      if (fileSize > aiagallery.main.Constant.MAX_SOURCE_FILE_SIZE)
      {
        // Clean up
        this.uploadReader.dispose();
        this.uploadReader = null;

        // Generate a message for image too large
        message = 
          "The file you attempted to upload was " +
          fileSize +
          " bytes, which is larger than the limit of " + 
          aiagallery.main.Constant.MAX_SOURCE_FILE_SIZE +
          " bytes.";              
        
        alert(message);
      }
      
      // Arrange to be told when the file is fully loaded
      this.uploadReader.addListener("load", this.fileLoaded, this);
      this.uploadReader.addListener("error", this.fileLoadError, this);

      // Get the selected File object
      uploadElement = this.uploadButton.getInputElement().getDomElement();
      selection = uploadElement.files[0];

      // Begin reading the file. Request that it be data-URL-encoded.
      this.uploadReader.readAsDataURL(selection);
    },
    
    /**
     * Event handler for the FileReader, when a file has been fully loaded
     * 
     * @param e {qx.event.type.Event}
     *   The "load" event
     */
    fileLoaded : function(e)
    {
      var             content;
      var             semiPos;
      var             mimeType;
      var             debugStr;
      var             message;
      var             filename;
      
      // Retrieve the data URL from the upload button, and save it.
      content = e.getData().content;

      // Extract the MIME type
      semiPos = content.indexOf(";");
      mimeType = semiPos > 5 ? content.substring(5, semiPos) : "";
      debugStr = content.substring(0, 30);

      // We're finished with this reader
      this.uploadReader = null;

      // Test for valid zip type. The zip file header is 0x04034b50 (little
      // endian). In base64, three bytes are encoded as four, so we look for
      // the encoding of 0x50, 0x4b, 0x03 as "UEsD".
      if(content.substring(semiPos+1, semiPos+12) == "base64,UEsD")
      {
        filename = this.uploadButton.getFileName().replace(/.*[\/\\]/g, "");
        this.setValue(filename);
        this.setContent(content);
      }
      else
      {
        // Generate an error message for invalid type
        message = 
          "The file you selected is not a valid '.zip' source file " +
          "(found " + debugStr + ")";
        alert(message);
      }
    },
    
    /**
     * Event handler for the FileReader, when a file load error occurs
     * 
     * @param e {qx.event.type.Event}
     *   The "error" event
     */
    fileLoadError : function(e)
    {
      // FIXME: Find a better mechanism for displaying the error
      alert("ERROR: " + e.progress + " (" + e.progress.getMessage() + ")");
    }
  }
});
