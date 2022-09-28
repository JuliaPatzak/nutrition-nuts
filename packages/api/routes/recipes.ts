import express, { application } from 'express'
import elasticSearchClient from '../elastic/elastic-client'

const router = express.Router()

// POST /recipes
router.post('/', async (req, res, next) => {
  const {query} = req.query
  const {allergies} = req.allergies

  // TODO: delete this. just an example of how to hit the elasticsearch from code
  let hits = await elasticSearchClient
    .search({
      index: 'recipes',
      query:{
        bool: {
          must: [
        {
          query_string: {
            query: String(query)
              }
            }
          ],
          must_not: [
            { wildcard: { ingredients: allergies } }
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
