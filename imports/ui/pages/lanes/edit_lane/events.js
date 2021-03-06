import { Template } from 'meteor/templating';
import { Lanes } from '../../../../api/lanes';

let update_harbor = function (template) {
  let inputs = template.$('.harbor').find('input');
  let values = {};
  let lane = Session.get('lane');

  _.each(inputs, function (element) {
    values[element.name] = element.type == 'checkbox' ?
      element.checked :
      element.value
    ;
  });

  return Meteor.call(
    'Harbors#update',
    lane,
    values,
    function update_harbor (err, lane) {
      if (err) throw err;

      Session.set('lane', lane);
    }
  );
};

Template.edit_lane.events({
  'submit form': function submit_form (event, template) {
    event.preventDefault();

    return update_harbor(template);
  },

  'change .harbor': function change_form (event, template) {
    let lane = Session.get('lane');
    let saved_lane = Lanes.findOne(lane._id);

    if (
      lane.name &&
      lane.name != 'New' &&
      lane.type
    ) {

      return update_harbor(template);
    }
  },

  'change .followup': function change_followup_lane (event) {
    let lane = Session.get('lane');
    let followup_lane = Lanes.findOne(event.target.value);

    lane.followup = followup_lane ? followup_lane._id : null;
    Lanes.update(lane._id, lane);
    Session.set('lane', lane);
  },

  'change .salvage-plan': function change_salvage_plan (event) {
    let lane = Session.get('lane');
    let salvage_plan_lane = Lanes.findOne(event.target.value);


    lane.salvage_plan = salvage_plan_lane ? salvage_plan_lane._id : null;
    Lanes.update(lane._id, lane);
    Session.set('lane', lane);
  },

  'change .lane-name': function change_lane_name (event) {
    let lane = Session.get('lane') || {};
    lane.name = event.target.value;
    Session.set('lane', lane);
    if (Lanes.findOne(lane._id)) { Lanes.update(lane._id, lane); }
    FlowRouter.go('/lanes/' + lane.name + '/edit');
  },

  'change .captains': function change_captains (event) {
    let lane = Session.get('lane');
    let captains = lane.captains || [];
    let user = event.target.value;

    if (event.target.checked) {
      captains.push(user);
    } else {
      captains = _.reject(captains, function remove_captain (captain) {
        return captain == user;
      });
    }
    lane.captains = captains;

    Session.set('lane', lane);
    if (Lanes.findOne(lane._id)) { Lanes.update(lane._id, lane); }
  },

  'click .add-harbor': function add_destination (event) {
    event.preventDefault();

    return Session.set('choose_type', true);
  },

  'click .back-to-lanes': function back_to_lanes (event) {
    event.preventDefault();

    Session.set('lane', null);
    return FlowRouter.go('/lanes');
  },

  'click .choose-harbor-type': function choose_harbor_type (event, template) {
    event.preventDefault();

    let type = $(event.target).attr('data-type');
    let lane = Session.get('lane');

    lane.type = type;
    Session.set('lane', lane);
    return Lanes.upsert({ _id: lane._id }, lane, function (err, count) {
      if (err || count < 1) throw (err || new Error('No Lanes modified!'));

      return update_harbor(template);
    });
  },

  'click .add-followup': function add_followup_lane (event) {
    return Session.set('choose_followup', true);
  },

  'click .add-salvage-plan': function add_salvage_plan (event) {
    return Session.set('choose_salvage_plan', true);
  }
});
