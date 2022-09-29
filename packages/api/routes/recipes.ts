import express from 'express'
import elasticSearchClient from '../elastic/elastic-client'

const router = express.Router()

// GET /recipes
router.get('/', async(req, res, next) => {
  // TODO: delete this. just an example of how to hit the elasticsearch from code
  let hits = await elasticSearchClient
    .search({
      index: 'recipes',
      query: {
        bool: {
          must: [
            {
              query_string: {
                query: String(req.query.query)
              }
            }
          ],
          must_not: [
            { wildcard: { ingredients: ('~' + String(req.query.allergies)) } }
          ]
        }
      }
    })
    .then((value) => value.hits.hits.map((hit) => hit._source) ?? [])

  // default case, give at least something back
  if (hits.length === 0) {
    hits = await elasticSearchClient
      .search({
        index: 'recipes',
        size: 10
      })
      .then((value) => value.hits.hits.map((hit) => hit._source) ?? [])
  }

  res.send(hits)
})

export default router
