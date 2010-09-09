/*globals YAHOO */
XC.Test.Service.Roster = new YAHOO.tool.TestCase({
  name: 'XC Roster Service Tests',

  setUp: function () {
    this.conn = XC.Test.MockConnection.extend().init();
    this.xc = XC.Connection.extend({connectionAdapter: this.conn});
    this.xc.initConnection();

    this.Roster = this.xc.Roster;
  },

  tearDown: function () {
    delete this.conn;
    delete this.xc;
  },

  testRequest: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(XC.Test.Packet.extendWithXML(
      '<iq to="marvin@heart-of-gold.com" \
           type="result" \
           id="test"> \
         <item jid="zaphod@heart-of-gold.com" \
               name="Zaphod"> \
           <group>President</group> \
         </item> \
         <item jid="ford@betelguice.net" \
               name="Ford Prefect"> \
           <group>Hitchhiker</group> \
         </item> \
      </iq>'
    ));

    var fail = false, win = false;
    this.Roster.requestItems({
      onSuccess: function (entities) {
        win = true;

        Assert.areEqual(entities[0].jid, "zaphod@heart-of-gold.com",
                        "The entity's jid is not what was expected.");
        Assert.areEqual(entities[0].name, "Zaphod",
                        "The entity's name is not what was expected.");
        Assert.areEqual(entities[0].groups[0], "President",
                        "The entity's group is not what was expected.");

        Assert.areEqual(entities[1].jid, "ford@betelguice.net",
                        "The entity's jid is not what was expected.");
        Assert.areEqual(entities[1].name, "Ford Prefect",
                        "The entity's name is not what was expected.");
        Assert.areEqual(entities[1].groups[0], "Hitchhiker",
                        "The entity's group is not what was expected.");
      },

      onError: function (packet) {
        fail = true;
      }
    });

    Assert.isTrue(win, "Was not successful in doing a roster request.");
    Assert.isFalse(fail, "Roster request threw an error.");
  },

  testRosterSetPush: function () {
    var Assert = YAHOO.util.Assert,
        packet = XC.Test.Packet.extendWithXML(
          '<iq type="set" id="set1"> \
             <query xmlns="jabber:iq:roster"> \
               <item jid="ford@betelguice.net" \
                     name="Ford Prefect"> \
                 <group>Hitchhiker</group> \
               </item> \
             </query> \
           </iq>');

    this.Roster.onRosterPush = function (entities) {
      Assert.areEqual(entities.length, 1,
                      "Unexpected number of resulting entities.");
      Assert.areEqual(entities[0].jid, 'ford@betelguice.net',
                      "The JID is incorrect.");
      Assert.areEqual(entities[0].name, 'Ford Prefect',
                      "The name is incorrect.");
      Assert.areEqual(entities[0].groups.length, 1,
                      "The number of groups is incorrect.");
      Assert.areEqual(entities[0].groups[0], "Hitchhiker",
                      "The group is incorrect.");
    };
    this.Roster._handleRosterPush(packet);

    var response = XC.Test.Packet.extendWithXML(this.conn._data);

    Assert.areEqual(response.getType(), 'result',
                    "The response did not have the type 'result'");
    response = response.getNode();
    Assert.areEqual(response.getAttribute('id'), 'set1',
                    "The response did not have the id 'set1'");
    Assert.areEqual(response.firstChild, null,
                    "The response is not supposed to have any children");
  },

  testRosterPush: function () {
    var Assert = YAHOO.util.Assert,
        packet = XC.Test.Packet.extendWithXML(
          '<iq type="result" id="result1"> \
             <query xmlns="jabber:iq:roster"> \
               <item jid="ford@betelguice.net" \
                     name="Ford Prefect"> \
                 <group>Hitchhiker</group> \
               </item> \
               <item jid="zaphod@heart-of-gold.com" \
                     name="Zaphod"> \
                 <group>President</group> \
                 <group>Imbecile</group> \
               </item> \
             </query> \
           </iq>');

    this.Roster.onRosterPush = function (entities) {
      Assert.areEqual(entities.length, 2,
                      "Unexpected number of resulting entities.");
      Assert.areEqual(entities[0].jid, 'ford@betelguice.net',
                      "The JID is incorrect.");
      Assert.areEqual(entities[0].name, 'Ford Prefect',
                      "The name is incorrect.");
      Assert.areEqual(entities[0].groups.length, 1,
                      "The number of groups is incorrect.");
      Assert.areEqual(entities[0].groups[0], "Hitchhiker",
                      "The group is incorrect.");

      Assert.areEqual(entities[1].jid, 'zaphod@heart-of-gold.com',
                      "The JID is incorrect.");
      Assert.areEqual(entities[1].name, 'Zaphod',
                      "The name is incorrect.");
      Assert.areEqual(entities[1].groups.length, 2,
                      "The number of groups is incorrect.");
      Assert.areEqual(entities[1].groups[0], "President",
                      "The group is incorrect.");
      Assert.areEqual(entities[1].groups[0], "Imbecile",
                      "The group is incorrect.");
    };
    this.Roster._handleRosterPush(packet);
  }

});

YAHOO.tool.TestRunner.add(XC.Test.Service.Roster);