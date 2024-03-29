
import gql from 'graphql-tag'


export function getRouteQuery() {
  return gql`query PublicSearch($ids: [String!]!) {
      publicSearch(search: { ids: $ids}) {
        id
        title
        body
        tag
        author
        total_dist
        max_elevation
        total_elevation
        created_at
        start_point
        goal_point
        summary
      }
      getPublicRoutes(ids: $ids) {
        id
        pos
        level
        kind
        note
      }
    }
    `
}

export function getPrivateRouteQuery() {
  return gql`query PrivateSearch($ids: [String!]!) {
      privateSearch(search: { ids: $ids}) {
        id
        title
        body
        tag
        author
        total_dist
        max_elevation
        total_elevation
        created_at
        start_point
        goal_point
        summary
      }
      getPrivateRoutes(ids: $ids) {
        id
        pos
        level
        kind
        note
      }
    }
    `
}
