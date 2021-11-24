import {GraphQLBoolean, GraphQLObjectType} from 'graphql'
import {resolveTask} from '../resolvers'
import Task from './Task'
import User from './User'
import StandardMutationError from './StandardMutationError'
import {GQLContext} from '../graphql'

const EditTaskPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'EditTaskPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    task: {
      type: Task,
      resolve: resolveTask
    },
    editor: {
      type: User,
      resolve: ({editorId}, _args: unknown, {dataLoader}) => {
        return editorId ? dataLoader.get('users').load(editorId) : null
      }
    },
    isEditing: {
      type: GraphQLBoolean,
      description: 'true if the editor is editing, false if they stopped editing'
    }
  })
})

export default EditTaskPayload
