/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for studio searching/browsing
 */
qx.Class.define("aiagallery.module.dgallery.groups.Gui",
{
  type   : "singleton",
  extend : qx.ui.core.Widget,

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
      var             o;
      var             fsm = module.fsm;
      var             canvas;
      var             outerCanvas = module.canvas;
      var             btnManage;
      var             btnBrowse;
      var             label;       

      // Layouts
      var             vBox; 
      var             layout;
      var             searchLayout; 

      // GUI Objects
      var             searchTextField;
      var             searchButton;
      var             browseByButton;
      var             typeSelectBox;
      var             subTypeSelectBox;  

      var             command; 

      // Layouts
      var             btnLayout; 
      var             scrollContainer; 

      // Need to access the fsm from other functions
      this.fsm = fsm; 

      // Put whole page into scroller
      scrollContainer = new qx.ui.container.Scroll();

      canvas = new qx.ui.container.Composite(new qx.ui.layout.VBox); 
      scrollContainer.add(canvas); 
      outerCanvas.add(scrollContainer, {flex : 1});

      // Create a search bar to search for groups
      layout = new qx.ui.layout.HBox(5);     
      searchLayout = new qx.ui.container.Composite(layout);

      // Description label
      label = new qx.ui.basic.Label(this.tr("Find a studio"));

      // Text field to enter search query
      searchTextField = new qx.ui.form.TextField;
      searchTextField.setWidth(500); 

      // Need to access the field on the fsm
      this.fsm.addObject("searchTextField", 
         searchTextField, "main.fsmUtils.disable_during_rpc");     

      // Button to execute search
      searchButton = new qx.ui.form.Button(this.tr("Search"));
      searchButton.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("searchBtn", 
         searchButton, "main.fsmUtils.disable_during_rpc");      

      // Allow 'Enter' to fire a search
      command = new qx.ui.core.Command("Enter");
      searchButton.setCommand(command);

      // Add label, button. and search text field to layout
      searchLayout.add(label); 
      searchLayout.add(searchTextField);
      searchLayout.add(searchButton);
    
      // Add to main layout
      canvas.add(searchLayout); 

      // Browse categories 
      layout = new qx.ui.layout.HBox(5);     
      searchLayout = new qx.ui.container.Composite(layout);

      // Add spacer to line up search buttons 
      searchLayout.add(new qx.ui.core.Spacer(157)); 

      label = new qx.ui.basic.Label(this.tr("Browse by type"));
      searchLayout.add(label);
      searchLayout.add(new qx.ui.core.Spacer(5)); 

      typeSelectBox = new qx.ui.form.SelectBox();

      typeSelectBox.add(new qx.ui.form.ListItem(this.tr("General"))); 
      typeSelectBox.add(new qx.ui.form.ListItem(this.tr("Educational"))); 

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("typeSelect", 
         typeSelectBox, "main.fsmUtils.disable_during_rpc");   

      // Update the subtype select box on changes
      typeSelectBox.addListener("changeSelection",
        function(e)
        {
          subTypeSelectBox.removeAll();

          if (e.getData()[0].getLabel().toString() == "General")
          {
            //subTypeSelectBox.add(
              //new qx.ui.form.ListItem(this.tr("No Options"))); 

            subTypeSelectBox.hide();
          }
          else 
          {
            subTypeSelectBox.show();

            subTypeSelectBox.add(
              new qx.ui.form.ListItem(this.tr("K-8"))); 
            subTypeSelectBox.add(
              new qx.ui.form.ListItem(this.tr("High School"))); 
            subTypeSelectBox.add(
              new qx.ui.form.ListItem(this.tr("College / University"))); 
          }           
        }
        , this); 

      searchLayout.add(typeSelectBox);      

      // Options added on change to typeSelectBox 
      subTypeSelectBox = new qx.ui.form.SelectBox();
      subTypeSelectBox.setWidth(160); 

      // Default option 
      //subTypeSelectBox.add(
        //new qx.ui.form.ListItem(this.tr("No Options"))); 

      // Start out hidden
      subTypeSelectBox.hide();

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("subTypeSelect", 
         subTypeSelectBox, "main.fsmUtils.disable_during_rpc");
      
      searchLayout.add(subTypeSelectBox);

      browseByButton = new qx.ui.form.Button(this.tr("Search"));
      browseByButton.addListener("execute", this.fsm.eventListener, this.fsm);

      // We'll be receiving events on the object so save its friendly name
      this.fsm.addObject("browseBtn", 
         browseByButton, "main.fsmUtils.disable_during_rpc");      

      searchLayout.add(new qx.ui.core.Spacer(20)); 
      searchLayout.add(browseByButton);

      canvas.add(new qx.ui.core.Spacer(0, 20));      
      canvas.add(searchLayout); 

      // Create a HBox to hold two vertical lists
      // that will show most recent/most active studios
      layout = new qx.ui.layout.HBox(10);     
      this.studioListContainer = new qx.ui.container.Composite(layout);

      layout = new qx.ui.layout.VBox(5);
      this.newestContainer = new qx.ui.container.Composite(layout);  
      label = new qx.ui.basic.Label(this.tr("Newest Created Studios")); 
      this.newestContainer.add(label); 

      layout = new qx.ui.layout.VBox(5);
      this.mostActiveContainer = new qx.ui.container.Composite(layout); 
      label = new qx.ui.basic.Label(this.tr("Latest Active Studios")); 
      this.mostActiveContainer.add(label);  

      this.studioListContainer.add(this.newestContainer);
      this.studioListContainer.add(this.mostActiveContainer);

      canvas.add(this.studioListContainer); 

      var font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
      font.setSize(18);

/* Simpler method for now
      // Show most active/newest groups 
      var newestStudiosLayout = new qx.ui.layout.VBox();
      newestStudiosLayout.set(
        {
          alignX : "center"
        });
      var newestStudios = new qx.ui.container.Composite(newestStudiosLayout);
      newestStudios.set(
        {
          decorator : "home-page-ribbon",
          padding   : 20
        });

      var newestStudiosHeader = new qx.ui.basic.Label();
      newestStudiosHeader.set(
        {
          value     : "Newest Studios",
          font      : font,
          decorator : "home-page-header"
        });
      newestStudios.add(newestStudiosHeader);
      
      // slide bar of Newest Apps
      var scroller = new qx.ui.container.Scroll();
      newestStudios.add(scroller);
      
      // Scroll container can hold only a single child. Create that child.
      this.newestStudiosContainer =
        new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
      this.newestStudiosContainer.set(
          {
            height : 210
          });
      scroller.add(this.newestStudiosContainer);
      canvas.add(scroller); 
*/

      // Search Results
      // Create the container to hold all the group objects
      this.groupContainer = new qx.ui.form.List();
      this.groupContainer.set(
        {
          selectionMode : "one",
          selectable    : true,
          maxHeight     : 500,
          maxWidth      : 700
        }
      );

      // Space out search bar and results
      canvas.add(new qx.ui.core.Spacer(0, 20)); 

      // Add the search results label
      label = new qx.ui.basic.Label(this.tr("Search Results"));
      label.set(
        {
          font : font
        });
      canvas.add(label);

      // Add to layout
      canvas.add(this.groupContainer, {flex : 1}); 

      // Label to be shown if there are no search results      
      this.__noResultsLabel =
        new qx.ui.basic.Label(this.tr("No results found")); 
      font = qx.theme.manager.Font.getInstance().resolve("bold").clone();;
      font.setSize(18);
      this.__noResultsLabel.setFont(font);
      
      // Start out hidden
      this.__noResultsLabel.hide(); 
      canvas.add(this.__noResultsLabel);
      
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
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result;
      var             groupList; 
      var             i; 
      var             label;
      var             count = 1; 

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
      // Browse Groups
      case "appear":
        result = response.data.result;

        this._setupStudioRibbons(result.newest, this.newestContainer);
        this._setupStudioRibbons(result.mostActive, this.mostActiveContainer);

/* More simple method for now
        // Populate the widge with the most recent/active studios
        // Fill the newest studio ribbon with data
        for (i = 0; i < result.newest[0].apps.length; i++)
        {
          // If this isn't the first one, ...
          if (i > 0)
          {
            // ... then add a spacer between the previous one and this one
            this.newestStudiosContainer.add(new qx.ui.core.Spacer(10));
          }

          // Add the thumbnail for this app
          var appNewest = result.newest[0].apps[i];
          var appThumbNewest = 
            new aiagallery.widget.SearchResult("studio", appNewest);
          this.newestStudiosContainer.add(appThumbNewest);

          // Associate the app data with the UI widget so it can be passed
          // in the click event callback
          appThumbNewest.setUserData("App Data", appNewest);
          
          // Fire an event specific to this application, sans a friendly name.
          appThumbNewest.addListener(
            "click", 
            function(e)
            {
              fsm.fireImmediateEvent(
                "homeRibbonAppClick", 
                this, 
                e.getCurrentTarget().getUserData("App Data"));
            });
        }
*/

        break;

      case "groupSearch":
      case "browseSearch": 
        result = response.data.result;

        // Clear search field before populating it
        this.groupContainer.removeAll();
 
        // If there are no search results display message
        if (result.length == 0)
        {
          this.groupContainer.exclude(); 

          // Show no results label
          this.__noResultsLabel.show(); 
        }
        else 
        {
          this.groupContainer.show(); 
          this.__noResultsLabel.hide(); 
        }

        // Array to hold all group layouts
        var groupArray = [];

        // Create gui group obj for each found group
        result.forEach(
          function(group)
          {
            var   groupGui; 
            var   label; 
            var   layout;

            // Concatenate into one long group string
            var groupStr = group.name + " Owned by: " + group.owner 
                           + " Type: " + group.type;

            if(group.subType)
            {
              groupStr += " SubType: " + group.subType;
            }

            var listItem = new qx.ui.form.ListItem(groupStr);

            // Will need the name later when we pop the group info page
            listItem.setUserData("groupName", group.name); 

            // On each dblcick on a list item pop the groupInfo page
            listItem.addListener("click", 
              function(e)
              {
                var groupName;

                // Get selection
                groupName = e.getTarget().getUserData("groupName");

                // Pop page
                aiagallery.module.dgallery
                  .groupinfo.GroupInfo.addGroupView(groupName, 
                                                    groupName);
              }
            );

            this.groupContainer.add(listItem);  

            return; 

            /* Beutify this later
            // Main group layout
            groupGui = new qx.ui.container.Composite(new qx.ui.layout.VBox());

            // Title and Author layout
            layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            label = new qx.ui.basic.Label(group.name);
            layout.add(label);

            label = new qx.ui.basic.Label(group.owner);
            layout.add(label); 

            // Add to main layout
            groupGui.add(layout);

            // Add description
            label = new qx.ui.basic.Label(group.description);
            groupGui.add(label);

            // Add category info
            layout = new qx.ui.container.Composite(new qx.ui.layout.HBox());

            label = new qx.ui.basic.Label(group.type);
            layout.add(label); 

            // Space out category types
            layout.add(new qx.ui.core.Spacer(10));

            label = new qx.ui.basic.Label(group.subType);
            layout.add(label); 

            // Add to main layout
            groupGui.add(layout);

            groupArray.push(groupGui);

            // Update the container with all the found groups
            this.groupContainer.add(groupGui);

            // Space out any results that come next
            //this.groupContainer.add(new qx.ui.core.Spacer(0, 20)); 
 
            */ 
          }

        ,this);
        break; 

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    },

    /**
     * Helper function to create studio lists on appear
     * 
     * @param studioArray {Array}
     *   An array containg studios and their data
     * 
     * @param container { qx.ui.container}
     *   Container to add the labels to
     */
    _setupStudioRibbons : function(studioArray, container)
    {
      var         label;
      var         count = 1; 

      studioArray.forEach(
        function(studio)
        {
          var   font;

          font = qx.theme.manager.Font.getInstance().resolve("bold").clone();
          font.set(
            {
              color      : "#75940c",     // android-green-dark
              decoration : "underline",
              size       : 12
            });

          label = new qx.ui.basic.Label(count + ". " + studio.name);
          label.setUserData("name", studio.name); 
          label.set(
            {
              textColor : null, // Prevent color override
              font      : font, 
              cursor    : "pointer"
            });

          label.addListener("click", 
            function(e)
            {
              var groupName;

              // Get selection
              groupName = e.getTarget().getUserData("name"); 

              // Pop page
              aiagallery.module.dgallery
                .groupinfo.GroupInfo.addGroupView(groupName, 
                                                    groupName);
            }
          );

          container.add(label); 
          count++; 
        }
      , this);
    }

  }
});
