const { Router } = require('express')

const withAsyncErrorHandler = require('../middlewares/async-error')

const router = Router()

const { UsersRepository } = require('./repository')

const repository = UsersRepository()

const NotFound = {
  error: 'Not found',
  message: 'Resource not found',
}

/*
  CRUD de usuários
  - C: create
  - R: read (listar + detalhes)
  - U: update
  - D: delete
*/

// ************
// ** create **
// ************

const createUser = async (req, res) => {
  // e se não for um JSON de usuário válido ?
  const user = req.body

  const inserted = await repository.insert(user)
  const location = `/api/users/${inserted.id}`
  res.status(201).header('Location', location).send(inserted)
}

router.post('/', withAsyncErrorHandler(createUser))

// ************
// ** update **
// ************

const updateUser = async (req, res) => {
  // e se for NaN ?
  const id = parseInt(req.params.id)

  // e se não for um JSON de usuário válido ?
  const body = req.body

  // repetido
  const registered = await repository.get(id)
  if (!registered) {
    return res.status(404).send(NotFound)
  }

  const user = { ...body, id }
  const updated = await repository.update(user)
  res.status(200).send(updated)
}

router.put('/:id', withAsyncErrorHandler(updateUser))

// ************
// ** delete **
// ************

const deleteUser = async (req, res) => {
  // e se for NaN ?
  const id = parseInt(req.params.id)

  // repetido
  const registered = await repository.get(id)
  if (!registered) {
    return res.status(404).send(NotFound)
  }

  await repository.del(id)
  res.status(204).send()
}

router.delete('/:id', withAsyncErrorHandler(deleteUser))

// **********
// ** read **
// **********

const listUsers = async (_req, res) =>
  repository
    .list()
    .then(users => res.status(200).send({ users }))

const getUser = async (req, res) => {
  // e se for NaN
  const id = parseInt(req.params.id)

  // repetido
  const user = await repository.get(id)
  if (!user) {
    return res.status(404).send(NotFound)
  }

  res.status(200).send(user)
}

router.get('/', withAsyncErrorHandler(listUsers))
router.get('/:id', withAsyncErrorHandler(getUser))

module.exports = router
