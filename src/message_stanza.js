/**
 * Simple Message class for XMPP Message stanzas
 * @class
 * @extends XC.Stanza
 * @extends XC.Mixin.ChatStateNotification.Message
 */
XC.MessageStanza = XC.Stanza.extend(XC.Mixin.ChatStateNotification.Message,
  /** @lends XC.MessageStanza# */{

  type: 'chat',

  /**
   * Unpack a message from a packet, or just do an ordinary init.
   *
   * @param {Function} $super The XC.Stanza toStanzaXML function
   * @private
   */
  init: function ($super) {
    $super.apply(this, Array.from(arguments).slice(1));

    if (this.packet) {
      var node = this.packet.getNode();
      this.mixin({
        body: XC_DOMHelper.getTextContent(
                node.getElementsByTagName('body')[0]
              ),
        thread: XC_DOMHelper.getTextContent(
                  node.getElementsByTagName('thread')[0]
                ),
        subject: XC_DOMHelper.getTextContent(
                   node.getElementsByTagName('subject')[0]
                 )
      });
    }
  }.around(),

  /**
   * @type String
   */
  subject: null,

  /**
   * @type String
   */
  body: null,

  /**
   * @type String
   */
  thread: null,

  /**
   * Reply to a message using this
   * message as a template, switching the
   * to and from attributes.
   *
   * @param {String} body The message body.
   * @param {String} [id] The id to associate with the message.
   * @returns {XC.MessageStanza} The sent message.
   */
  reply: function (body, id) {
    var msg = this.extend({
      to: this.from,
      body: body,
      id: id
    });

    msg.to.connection.send(msg.toStanzaXML().convertToString());
  },

  /**
   * The builder for XC.Stanza's base toStanzaXML
   * @private
   */
  xmlStanza: XC.XML.XMPP.Message,

  /**
   * Converts a message into an XML Fragment.
   *
   * @param {Function} $super The XC.Stanza toStanzaXML function
   * @returns {XC.XML.Element} A XML Fragment.
   */
  toStanzaXML: function ($super) {
    var msg = $super.apply(this, Array.from(arguments).slice(1));

    var els = ['body', 'subject', 'thread'];
    for (var i = 0; i < els.length; i++) {
      if (!this[els[i]]) {
        continue;
      }

      msg.addChild(XC.XML.Element.extend({
        name: els[i],
        text: this[els[i]]
      }));
    }

    return msg;
  }.around()
});