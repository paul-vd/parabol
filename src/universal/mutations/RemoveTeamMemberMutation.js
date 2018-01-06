import {commitMutation} from 'react-relay';
import {matchPath} from 'react-router-dom';
import {showWarning} from 'universal/modules/toast/ducks/toastDuck';
import ClearNotificationMutation from 'universal/mutations/ClearNotificationMutation';
import handleAddNotifications from 'universal/mutations/handlers/handleAddNotifications';
import handleRemoveNotifications from 'universal/mutations/handlers/handleRemoveNotifications';
import handleRemoveProjects from 'universal/mutations/handlers/handleRemoveProjects';
import handleRemoveTeamMembers from 'universal/mutations/handlers/handleRemoveTeamMembers';
import handleRemoveTeams from 'universal/mutations/handlers/handleRemoveTeams';
import handleUpsertProjects from 'universal/mutations/handlers/handleUpsertProjects';
import getInProxy from 'universal/utils/relay/getInProxy';

graphql`
  fragment RemoveTeamMemberMutation_project on RemoveTeamMemberOtherPayload {
    updatedProjects {
      id
      tags
      teamMemberId
      teamMember {
        id
        preferredName
        picture
      }
      userId
    }
  }
`;

graphql`
  fragment RemoveTeamMemberMutation_teamMember on RemoveTeamMemberPayload {
    teamMember {
      id
    }
  }
`;

graphql`
  fragment RemoveTeamMemberMutation_team on RemoveTeamMemberExMemberPayload {
    updatedProjects {
      id
    }
    removedNotifications {
      id
    }
    kickOutNotification {
      ...KickedOut_notification @relay(mask: false)
    }
    team {
      id
    }
  }
`;

const mutation = graphql`
  mutation RemoveTeamMemberMutation($teamMemberId: ID!) {
    removeTeamMember(teamMemberId: $teamMemberId) {
      ...RemoveTeamMemberMutation_teamMember @relay(mask: false)
      ...RemoveTeamMemberMutation_project @relay(mask: false)
      ...RemoveTeamMemberMutation_team @relay(mask: false)
    }
  }
`;

const popKickedOutNotification = (payload, {dispatch, environment, history, location}) => {
  const kickOutNotification = payload.getLinkedRecord('kickOutNotification');
  const teamId = getInProxy(kickOutNotification, 'team', 'id');
  if (!teamId) return;
  const teamName = getInProxy(kickOutNotification, 'team', 'name');
  dispatch(showWarning({
    autoDismiss: 10,
    title: 'So long!',
    message: `You have been removed from ${teamName}`,
    action: {
      label: 'OK',
      callback: () => {
        const notificationId = payload.getValue('id');
        ClearNotificationMutation(environment, notificationId);
      }
    }
  }));
  const {pathname} = location;
  const onExTeamRoute = Boolean(matchPath(pathname, {
    path: `(/team/${teamId}|/meeting/${teamId})`
  }));
  if (onExTeamRoute) {
    history.push('/me');
  }
};

export const removeTeamMemberProjectsUpdater = (payload, store, viewerId) => {
  const type = payload.getValue('__typename');
  const projects = payload.getLinkedRecords('updatedProjects');
  if (type === 'RemoveTeamMemberExMemberPayload') {
    const projectIds = getInProxy(projects, 'id');
    handleRemoveProjects(projectIds, store, viewerId);
  } else if (type === 'RemoveTeamMemberOtherPayload') {
    handleUpsertProjects(projects, store, viewerId);
  }
  console.error('removeTeamMemberProjectsUpdater unhandled type', type);
};

export const removeTeamMemberTeamMemberUpdater = (payload, store) => {
  const teamMemberId = getInProxy(payload, 'teamMember', 'id');
  handleRemoveTeamMembers(teamMemberId, store);
};

export const removeTeamMemberTeamUpdater = (payload, store, viewerId, options) => {
  const notificationIds = getInProxy(payload, 'removedNotifications', 'id');
  handleRemoveNotifications(notificationIds, store, viewerId);

  const teamId = getInProxy(payload, 'team', 'id');
  handleRemoveTeams(teamId, store, viewerId);

  const notification = payload.getLinkedRecord('notification');
  handleAddNotifications(notification, store, viewerId);
  popKickedOutNotification(payload, options);
};

export const removeTeamMemberUpdater = (payload, store, viewerId, options) => {
  removeTeamMemberTeamMemberUpdater(payload, store);
  removeTeamMemberProjectsUpdater(payload, store, viewerId);
  removeTeamMemberTeamUpdater(payload, store, viewerId, options);
};

const RemoveTeamMemberMutation = (environment, teamMemberId, options) => {
  const {viewerId} = environment;
  return commitMutation(environment, {
    mutation,
    variables: {teamMemberId},
    updater: (store) => {
      const payload = store.getRootField('removeTeamMember');
      removeTeamMemberUpdater(payload, store, viewerId, {environment, store, ...options});
    }
  });
};

export default RemoveTeamMemberMutation;
