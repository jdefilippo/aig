/**
 * Copyright (c) 2012 Derrell Lipman
 * Copyright (c) 2012 Paul Geromini 
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the permission management page
 */
qx.Class.define("aiagallery.module.mgmt.permissions.Gui",
{
  type : "singleton",
  extend :  qx.ui.core.Widget,

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
      var             fsm = module.fsm;
      
      // Layout vars
      var             canvas = module.canvas;   
      var             layout;
      var             hBox;
      var             vBoxBtns;
      var             vBoxText; 
      var             whitelistGroup;
      var             grid;
      
      // Button vars
      var             addPermissionGroup;
      var             savePermissionGroup;
      var             deletePermissionGroup;
      var             addToWhitelist;
      var             removeFromWhitelist;
      
      // GUI Elements
      var             pGroupNameField; 
      var             pGroupDescriptionField; 
      var             pGroupInfo; 
      var             pGroupNameList;
      var             possiblePermissionList;
      var             pDataArray; 
      var             label;
      
      // Misc vars
      var             bEnable;

      // Create a layout for this page
      canvas.setLayout(new qx.ui.layout.VBox());   

      // We'll left-justify some buttons in a button row
      layout = new qx.ui.layout.HBox();
      layout.setSpacing(10);      
      hBox = new qx.ui.container.Composite(layout);

      // Create a virtual box for the buttons
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxBtns = new qx.ui.container.Composite(layout);
      
      // Create an Add Permission button
      addPermissionGroup = 
        new qx.ui.form.Button(this.tr("Add Permission Group"));
      addPermissionGroup.set(
      {
        maxHeight : 24,
        width     : 150
      });
      vBoxBtns.add(addPermissionGroup);
      addPermissionGroup.addListener("execute", fsm.eventListener, fsm);

      // Disable button on startup since textfield will be empty
      addPermissionGroup.setEnabled(false);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("addPermissionGroup", 
         addPermissionGroup, "main.fsmUtils.disable_during_rpc");

      // Create an Save Permission Group button
      savePermissionGroup = new qx.ui.form.Button(this.tr("Save"));
      savePermissionGroup.set(
      {
        maxHeight : 24,
        width     : 100
      });
      vBoxBtns.add(savePermissionGroup);
      savePermissionGroup.addListener("execute", fsm.eventListener, fsm);

      // Disable button on startup 
      savePermissionGroup.setEnabled(false); 
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("savePermissionGroup", 
         savePermissionGroup, "main.fsmUtils.disable_during_rpc");

      // Create a Delete button
      deletePermissionGroup = new qx.ui.form.Button(this.tr("Delete"));
      deletePermissionGroup.set(
      {
        maxHeight : 24,
        width     : 100,
        enabled   : false
      });
      vBoxBtns.add(deletePermissionGroup);
      deletePermissionGroup.addListener("execute", fsm.eventListener, fsm);
      
      hBox.add(vBoxBtns);
      
      // Disable button on startup 
      deletePermissionGroup.setEnabled(false);
      
      // We'll be receiving events on the object so save its friendly name
      fsm.addObject("deletePermissionGroup", 
         deletePermissionGroup, "main.fsmUtils.disable_during_rpc");
      
      // Create a vertical layout just for the two textfields and labels.
      layout = new qx.ui.layout.VBox();
      layout.setSpacing(10);      
      vBoxText = new qx.ui.container.Composite(layout);
      
      // Create a label for describing the textfields 
      label = new qx.ui.basic.Label("Permission Group Name:");
      vBoxText.add(label);
      
      // Create textfield for entering in a pGroup name
      pGroupNameField = new qx.ui.form.TextField;
      pGroupNameField.set(
      {
        width     : 200
      });
      vBoxText.add(pGroupNameField);

      // Only enable add button if there is something in the textfield
      pGroupNameField.addListener("input", function(e) 
      {
        var value = e.getData();
        addPermissionGroup.setEnabled(value.length > 0);
        
        // When a user starts typing a new pGroup deselect everything
        // Deselect all values on the permission list
        possiblePermissionList.resetSelection(); 
        
        // Deselet all pgroup names
        pGroupNameList.resetSelection(); 
        
        // Clear description field 
        pGroupDescriptionField.setValue("");           
      }, this); 

      // Create friendly name to get it from the FSM
      fsm.addObject("pGroupNameField", 
         pGroupNameField,"main.fsmUtils.disable_during_rpc");
         
      // Create a textfield to enter a description for the pGroup
      pGroupDescriptionField = new qx.ui.form.TextField;
      pGroupNameField.set(
      {
        width     : 200
      });
      
      //Create a label for describing the textfields 
      label = new qx.ui.basic.Label("Description:");
      vBoxText.add(label);
      
      vBoxText.add(pGroupDescriptionField);
      
      //Add vertical layout to horizantal layout
      hBox.add(vBoxText); 
      
      // Create friendly name to get it from the FSM
      fsm.addObject("pGroupDescriptionField", 
         pGroupDescriptionField,"main.fsmUtils.disable_during_rpc");

      // Create a set of finder-style multi-level browsing lists
      pGroupInfo = new qx.ui.groupbox.GroupBox("Permission Groups");
      pGroupInfo.setLayout(new qx.ui.layout.HBox());
      pGroupInfo.setContentPadding(0);
      hBox.add(pGroupInfo);

      // create and add the lists. Store them in an array.
      pGroupNameList = new qx.ui.form.List();
      pGroupNameList.setWidth(150);
      pGroupNameList.addListener("changeSelection", fsm.eventListener, fsm);
      
      //Disable delete/save button unless something is selected
      pGroupNameList.addListener("changeSelection", function(e) 
      {
        bEnable = (pGroupNameList.getSelection().length != 0);
        savePermissionGroup.setEnabled(bEnable);
        deletePermissionGroup.setEnabled(bEnable);
      }, this); 

      pGroupInfo.add(pGroupNameList);
      fsm.addObject("pGroupNameList", 
        pGroupNameList, "main.fsmUtils.disable_during_rpc");     

      possiblePermissionList = new qx.ui.form.List();
      possiblePermissionList.setWidth(150);
      possiblePermissionList.addListener("changeSelection", 
        fsm.eventListener, fsm);

      // Allow user to select multiple items
      possiblePermissionList.setSelectionMode("multi");

      // Create a data array of possible permissions
      pDataArray = new qx.data.Array
       (qx.lang.Object.getKeys(aiagallery.dbif.Constants.Permissions));
      
      // Create controller to add data to possiblePermissionList
      this.permissionController 
        = new qx.data.controller.List(pDataArray, possiblePermissionList); 
        
      pGroupInfo.add(possiblePermissionList);
      fsm.addObject("possiblePermissionList", 
        possiblePermissionList, "main.fsmUtils.disable_during_rpc");

      // Add to the page
      canvas.add(hBox);

      // Create the group box for whitelist modification
      whitelistGroup = new qx.ui.groupbox.GroupBox("Whitelist management");
      whitelistGroup.setLayout(new qx.ui.layout.VBox());
      
      // We'll put the whitelist fields in a grid
      layout = new qx.ui.layout.Grid(10, 10);
      layout.setRowFlex(2, true);
      grid = new qx.ui.container.Composite(layout);

      // Add a text area in which to enter email addresses
      label = new qx.ui.basic.Label("Enter email addresses");
      grid.add(label, { row : 0, column : 0 });
      this.whitelistAddrs = new qx.ui.form.TextArea();
      this.whitelistAddrs.set(
        {
          width  : 200,
          height : 400
        });
      fsm.addObject("whitelistAddrs", 
                    this.whitelistAddrs, 
                    "main.fsmUtils.disable_during_rpc");
      grid.add(this.whitelistAddrs, { row : 1, column : 0, rowSpan : 3 });
      
      // Add a button to add the selection to the whitelist
      addToWhitelist = new qx.ui.form.Button("Add to whitelist");
      addToWhitelist.set(
        {
          height    : 30,
          maxHeight : 30
        });
      grid.add(addToWhitelist, { row : 1, column : 1 });
      fsm.addObject("addToWhitelist", 
                    addToWhitelist, 
                    "main.fsmUtils.disable_during_rpc");
      addToWhitelist.addListener("execute", fsm.eventListener, fsm);

      // Add a button to remove the selection from the whitelist
      removeFromWhitelist = new qx.ui.form.Button("Remove from whitelist");
      removeFromWhitelist.set(
        {
          height    : 30,
          maxHeight : 30
        });
      grid.add(removeFromWhitelist, { row : 2, column : 1 });
      fsm.addObject("removeFromWhitelist", 
                    removeFromWhitelist, 
                    "main.fsmUtils.disable_during_rpc");
      removeFromWhitelist.addListener("execute", fsm.eventListener, fsm);
      
      // Add a list to display failures
      label = new qx.ui.basic.Label("Failures");
      grid.add(label, { row : 0, column : 2 });
      this.failures = new qx.ui.form.TextArea();
      this.failures.set(
        {
          width    : 200,
          height   : 200,
          readOnly : true
        });
      grid.add(this.failures, { row : 1, column : 2, rowSpan : 3 });

      // Add the grid to the whitelist group
      whitelistGroup.add(grid);
      
      // Add the whitelist group to the canvas
      canvas.add(whitelistGroup);
    },

    
    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             pGroupNameList = fsm.getObject("pGroupNameList");
      var             possiblePermissionList = 
                        fsm.getObject("possiblePermissionList");
                        
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;
      var             pGroupNameField = fsm.getObject("pGroupNameField");
      var             delBtn = fsm.getObject("deletePermissionGroup");
      var             saveBtn = fsm.getObject("savePermissionGroup");
      var             addBtn = fsm.getObject("addPermissionGroup"); 
      var             pGroupDescriptionField = 
                        fsm.getObject("pGroupDescriptionField");
      var             returnedList;
      var             dataArray;
      var             numSuccess;
      var             numFail;
      var             failureList;
      
      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "appear" :
        //Got the array of permission groups 
        //If the array is not empty we need to do something
        var pArray = response.data.result;
        
        // Convert pGroupNameList to Array to see if it already
        // contains the pgroup we may be trying to add
        var pGroupLabels = pGroupNameList.getChildren().map(
          function(listItem)
          {
            return listItem.getLabel();
          }); 
        
        for (var i = 0; i < pArray.length; i++)
        {

          // Does the list already contain this pGroup
          // If not do not add it
          if (!qx.lang.Array.contains(pGroupLabels, pArray[i].name)){

            // Add to list
            var pName = new qx.ui.form.ListItem(pArray[i].name);   
            pGroupNameList.add(pName);
            
            // Fill the description field
            pGroupDescriptionField.setValue(pArray[i].description);         
          
            // Select it
            pGroupNameList.setSelection([pName]); 

            // Convert to a data Array.
            var dataArray = new qx.data.Array(pArray[i].permissions);
        
            // Set Selection using controller
            this.permissionController.setSelection(dataArray); 
          }          
        }
        
        //There was nothing in the array make sure buttons are disabled
        //They should be disabled, but they are not in this case
        delBtn.setEnabled(pArray.length != 0); 
        saveBtn.setEnabled(pArray.length != 0); 

        //Ensure Add Btn is disabled
        addBtn.setEnabled(false);
        break; 
 
      case "addOrEditPermissionGroup" : 
        if (response.data.result == "false") 
        {
          // Permission group name already exists
          alert("The selected Permission Group has already been deleted.");
          
          // Permission group was deleted remove it from the list
          pGroupNameList.remove(pGroupNameList.getSelection()[0]);
          
          // Clear all current selections on list 2 (the list of permissions)
          possiblePermissionList.resetSelection(); 
          
          break;
        }

        // Creation was a success add to list. 
        var pName = new qx.ui.form.ListItem(response.data.result.name);        
        pGroupNameList.add(pName);	
        
        // Select on list
        pGroupNameList.setSelection([pName]); 
        
        // Clear textFields
        pGroupNameField.setValue("");
        pGroupDescriptionField.setValue("");      
        
        // Possibly returned an existing pGroup
        // Clear all current selections on the list of permissions
        possiblePermissionList.resetSelection(); 
        
        // Make things easier to read
        returnedList = response.data.result.permissions;
        
        // Convert to a data Array.
        dataArray = new qx.data.Array(returnedList);
        
        // Set Selectiong using controller
        this.permissionController.setSelection(dataArray); 
            
        // Ensure Add Btn is disabled
        addBtn.setEnabled(false);
        break; 

      case "deletePermissionGroup" :
        if (response.data.result == "false") 
        {
          // Delete failed
          alert("An error occurred trying to delete this permission group.");
          break;
        }
        
        // Permission group was deleted remove it from the list
        pGroupNameList.remove(pGroupNameList.getSelection()[0]);
        
        // Clear all current selections on list 2 (the list of permissions)
        possiblePermissionList.resetSelection(); 
        
        // Clear the description field
        pGroupDescriptionField.setValue("");    
        
        // Ensure Add Btn is disabled
        addBtn.setEnabled(false);
        break; 
        
      case "getGroupPermissions" :
        // I need this since if I put it all in one switch I 
        // Cannot detect just a changeSelection and thus
        // it will keep looping         
      
        // Clear all current selections on the list of permissions
        possiblePermissionList.resetSelection(); 
        
        // Fill the description field
        pGroupDescriptionField.setValue(response.data.result.description);    
        
        // Make things easier to read
        returnedList = response.data.result.permissions;
        
        // Convert to a data Array.
        dataArray = new qx.data.Array(returnedList);
        
        // Set Selectiong using controller
        this.permissionController.setSelection(dataArray); 

      case "addOrEditPermissionGroup_save" :
        // Everything is all set 
        break;       

      case "whitelistVisitors" :
        // The return value is a map containing two arrays: successes and
        // failures. All we need to do is add the failures to the failure
        // list.
        this.failures.setValue(response.data.result.failures.join("\n"));
        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
