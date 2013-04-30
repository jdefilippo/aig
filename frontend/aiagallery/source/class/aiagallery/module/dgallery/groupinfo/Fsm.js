/**
 * Copyright (c) 2013 Derrell Lipman
 *                    Paul Geromini
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
require(aiagallery.module.dgallery.appinfo.AppInfo)
 */

/**
 * GroupInfo Finite State Machine
 */
qx.Class.define("aiagallery.module.dgallery.groupinfo.Fsm",
{
  type   : "singleton",
  extend : aiagallery.main.AbstractModuleFsm,

  members :
  {
    buildFsm : function(module)
    {
      var fsm = module.fsm;
      var state;
      var trans;

      // ------------------------------------------------------------ //
      // State: Idle
      // ------------------------------------------------------------ //

      /*
       * State: Idle
       *
       * Actions upon entry
       *   - if returning from RPC, display the result
       */

      state = new qx.util.fsm.State("State_Idle",
      {
        "context" : this,

        "onentry" : function(fsm, event)
        {
          // Did we just return from an RPC request?
          if (fsm.getPreviousState() == "State_AwaitRpcResult")
          {
            // Yup.  Display the result.  We need to get the request object
            var rpcRequest = this.popRpcRequest();

            // Call the standard result handler
            var gui = aiagallery.module.dgallery.groupinfo.Gui.getInstance();
            gui.handleResponse(module, rpcRequest);

            // Dispose of the request
            if (rpcRequest.request)
            {
              rpcRequest.request.dispose();
              rpcRequest.request = null;
            }
          }
        },

        "events" :
        {
          // On the clicking of a button, execute is fired
          "execute" :
          {
            
            "joinBtn" : "Transition_Idle_to_AwaitRpcResult_via_joinGroup"
          },
          
          // Clicked on an authored app
          "authoredAppClick" :
            "Transition_Idle_to_Idle_via_authoredAppClick",

          // User is flagging group
          "flagGroup" : 
             "Transition_Idle_to_AwaitRpcResult_via_flagGroup",  

          // User is associating apps they own to this group they are part of
          "ascApp" : "Transition_Idle_to_AwaitRpcResult_via_ascApp",  

          // When we get an appear event, retrieve the category tags list. We
          // only want to do it the first time, though, so we use a predicate
          // to determine if it's necessary.
          "appear"    :
          {
            "main.canvas" : 
              "Transition_Idle_to_AwaitRpcResult_via_appear"
          },

          // When we get a disappear event
          "disappear" :
          {
            //"main.canvas" : "Transition_Idle_to_Idle_via_disappear"
          }
        }
      });

      // Replace the initial Idle state with this one
      fsm.replaceState(state, true);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "appear" on canvas
       *
       * Action:
       *  If this is the very first appear, retrieve group info.
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_appear",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,
/*
        "predicate" : function(fsm, event)
        {
          // Have we already been here before?
          if (fsm.getUserData("noUpdate"))
          {
            // Yup. Don't accept this transition and no need to check further.
            return null;
          }
          
          // Prevent this transition from being taken next time.
          fsm.setUserData("noUpdate", true);
          
          // Accept this transition
          return true;
        },
*/
        "ontransition" : function(fsm, event)
        {
          var     request; 

          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "getGroup",
                         [
                           module.getUserData("studioName"), true
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "appear");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: User clicked join group button
       *
       * Action:
       *  Try and join the group the user is on
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_joinGroup",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request; 

          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "joinGroup",
                         [
                           module.getUserData("studioName")
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "joinGroup");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: User is associating an app they own, via 
       *        the popup dialog, with this group
       *
       * Action:
       *  Associate the app with this group
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_ascApp",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var     request; 
          var     ascApps;
 
          ascApps = event.getData();          
 
          request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "associateAppsWithGroup",
                         [
                           ascApps,
                           module.getUserData("studioName")
                         ]);

          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "ascApps");

        }
      });

      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: An authored app has been clicked
       *
       * Action:
       *  Create (if necessary) and switch to an application-specific tab
       */
      
      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_authoredAppClick",
      {
        "nextState" : "State_Idle",
      
        "context" : this,
      
        "ontransition" : function(fsm, event)
        {
          // Get the event data
          var             item = event.getData();

          // Add a module for the specified app
          aiagallery.module.dgallery.appinfo.AppInfo.addAppView(item.uid, 
                                                               item.title);

        }
      });
      
      state.addTransition(trans);

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_AwaitRpcResult_via_flagGroup",
      {
        "nextState" : "State_AwaitRpcResult",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
          var             groupname;
          var             reason;
          var             map;
          
          // Get the data map
          map = event.getData();
          
          // Break out the map
          groupname = map.groupname;
          reason = map.reason; 

          var request =
            this.callRpc(fsm,
                         "aiagallery.features",
                         "flagIt",
                         [ 
                           aiagallery.dbif.Constants.FlagType.Group,     
                           reason,  // reason
                           null,
                           null, 
                           groupname // String of the user's name
                         ]);


          // When we get the result, we'll need to know what type of request
          // we made.
          request.setUserData("requestType", "flagGroup");
        }
      });
      
      state.addTransition(trans);

      /*
       * Transition: Idle to Idle
       *
       * Cause: "disappear" on canvas
       *
       * Action:
       *  Stop our timer
       */

      trans = new qx.util.fsm.Transition(
        "Transition_Idle_to_Idle_via_disappear",
      {
        "nextState" : "State_Idle",

        "context" : this,

        "ontransition" : function(fsm, event)
        {
        }
      });

      state.addTransition(trans);

      
      // ------------------------------------------------------------ //
      // State: <some other state>
      // ------------------------------------------------------------ //

      // put state and transitions here




      // ------------------------------------------------------------ //
      // State: AwaitRpcResult
      // ------------------------------------------------------------ //

      // Add the AwaitRpcResult state and all of its transitions
      this.addAwaitRpcResultState(module);


      // ------------------------------------------------------------ //
      // Epilog
      // ------------------------------------------------------------ //

      // Listen for our generic remote procedure call event
      fsm.addListener("callRpc", fsm.eventListener, fsm);
    }
  }
});
