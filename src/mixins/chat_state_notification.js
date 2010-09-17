/**
 * Chat State Notifications Mixins
 * @namespace
 *
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Mixin.ChatStateNotification = {};

/**
 * Chat State Notifications Mixin for XC.Entity
 * @namespace
 *
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Mixin.ChatStateNotification.Entity = {

  /**
   * Send a chat state notification to another entity.
   *
   * @param {String} state    The chat notification state: 'composing', 'paused', 'inactive', 'gone'.
   * @param {XC.Entity} to    The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id]     The ID to be associated with the message.
   */
  sendChatStateNotification: function (state, to, thread, id) {
    var msg = XC.Message.extend({
      to: to,
      thread: thread,
      id: id,
      chatNotificationState: state
    });

    this.connection.send(msg.toStanzaXML().convertToString());
  }
};

XC.Base.mixin.call(XC.Mixin.ChatStateNotification.Entity, /** @lends XC.Mixin.ChatStateNotification.Entity */{
  /**
   * Send a composing message.
   *
   * @param {XC.Entity} to    The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id]     The ID to be associated with the message.
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStateComposing:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.ChatStateNotification.STATES.COMPOSING
    ),

  /**
   * Send a composing message.
   *
   * @param {XC.Entity} to    The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id]     The ID to be associated with the message.
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStatePaused:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.ChatStateNotification.STATES.PAUSED
    ),

  /**
   * Send a inactive message.
   *
   * @param {XC.Entity} to    The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id]     The ID to be associated with the message.
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStateInactive:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.ChatStateNotification.STATES.INACTIVE
    ),

  /**
   * Send a gone message.
   * You MUST NOT re-use the same Thread ID after recieving a <gone/> message
   * from another entity. Generate a new Thread ID for any subsequest messages.
   *
   * @param {XC.Entity} to    The entity to send the chat state notification to.
   * @param {String} [thread] The thread of the message.
   * @param {String} [id]     The ID to be associated with the message.
   * @see XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification
   */
  sendChatStateGone:
    XC.Mixin.ChatStateNotification.Entity.sendChatStateNotification.curry(
      XC.ChatStateNotification.STATES.GONE
    )
});

/**
 * Chat State Notifications Mixins XC.Message
 * @namespace
 * 
 * @see <a href="http://xmpp.org/extensions/xep-0085.html">XEP-0085: Chat State Notifications</a>
 */
XC.Mixin.ChatStateNotification.Message = {

  /**
   * The chat notification state of the message.
   * @type {String} Defaults to 'active'; can be any in XC.ChatStateNotification.STATES
   */
  chatNotificationState: XC.ChatStateNotification.STATES.ACTIVE,

  /**
   * Unpack the chat state from the message.
   * @private
   *
   * @param {Function} $super The function that this is wrapped around.
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    // Add Chat State Notifications as a discoverable service
    if (this.connection) {
      //TODO This is wrong. This an architectural problem,
      // and needs to be fixed as a general case for Mixins that register
      // their own features. This can be optimized, since it does a linear
      // lookup on to check for conflicts in addFeature, not adding it if
      // the feature already exists.
      // <tim.evans@junctionnetworks.com>
      var registrar = XC.Base.extend(XC.Mixin.Discoverable, {
        connection: this.connection
      });
      registrar.addFeature(XC.ChatStateNotification.XMLNS);
    }

    if (this.packet) {
      var pkt = this.packet, stateNode;

      stateNode = XC_DOMHelper.getElementsByNS(pkt.getNode(),
                    XC.ChatStateNotification.XMLNS);
      stateNode = stateNode[0];

      if (stateNode) {
        this.chatNotificationState = stateNode.nodeName;
      }
    }
  }.around(),

  /**
   * Append the chat state child to the message when it
   * is translated into a stanza.
   *
   * @param {Function} $super The function that this is wrapped around.
   * @returns {XC.XMPP.Message} A constructed chat message.
   */
  toStanzaXML: function ($super) {
    var msg = $super.apply(this, Array.from(arguments).slice(1));
    if (this.chatNotificationState) {
      msg.addChild(XC.XML.Element.extend({
        name: this.chatNotificationState,
        xmlns: XC.Mixin.ChatStateNotification.XMLNS
      }));
    }

    return msg;
  }.around()
};
