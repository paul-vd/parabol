import {GraphQLBoolean, GraphQLNonNull, GraphQLString} from 'graphql'

import getRethink from '../../../database/rethinkDriver'

const enableSAMLForDomain = {
  type: new GraphQLNonNull(GraphQLBoolean),
  description: 'Enable SAML for domain',
  args: {
    url: {
      type: new GraphQLNonNull(GraphQLString)
    },
    domain: {
      type: GraphQLNonNull(GraphQLString)
    },
    metadata: {
      type: GraphQLNonNull(GraphQLString)
    }
  },
  async resolve(_source, {url, domain, metadata}) {
    const r = await getRethink()
    const normalizedDomain = domain.toLowerCase()
    const normalizedUrl = url.toLowerCase()

    await r
      .table('SAML')
      .insert(
        {
          id: normalizedDomain,
          url: normalizedUrl,
          metadata: metadata
        },
        {conflict: 'replace'}
      )
      .run()

    return true
  }
}

export default enableSAMLForDomain
