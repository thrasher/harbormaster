import { Template } from 'meteor/templating';
import { Lanes } from '../../../../api/lanes';
import { Harbors } from '../../../../api/harbors';
import { Shipments } from '../../../../api/shipments';

Template.ship_lane.events({
  'click .start-shipment': function () {
    let name = FlowRouter.getParam('name');
    let lane = Lanes.findOne({ name: name });
    let harbor = Harbors.findOne(lane.type);
    let manifest = harbor.lanes[lane._id].manifest;
    let date = new Date();
    //TODO: share w/ server code
    let shipment_start_date = date.getFullYear() + '-' +
      date.getMonth() + '-' +
      date.getDate() + '-' +
      date.getHours() + '-' +
      date.getMinutes() + '-' +
      date.getSeconds()
    ;
    let shipment = Shipments.findOne({
      start: shipment_start_date,
      lane: lane._id
    });

    if (! shipment || ! shipment.active) {
      Meteor.call(
        'Lanes#start_shipment',
        lane._id,
        manifest,
        shipment_start_date,
        function (err, res) {
          if (err) throw err;

          console.log('Shipment started for lane:', lane.name);
          FlowRouter.go('/lanes/' + name + '/ship/' + shipment_start_date);

          return res;
        }
      );
    }

    return lane;
  },

  'click .reset-shipment': function () {
    let name = FlowRouter.getParam('name');
    let date = FlowRouter.getParam('date');

    Meteor.call('Lanes#reset_shipment', name, date, function (err, res) {
      if (err) throw err;
      console.log('Reset shipment response:', res);
    });
  }
});
