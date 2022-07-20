import { getHistory, publish } from './dependencies/eventStore'
import { DomainEvent } from './libs/eventSourcing/types/DomainEvent'
import { FauxUtilisateurInscrit } from './events'
import { getUuid } from './libs/getUuid'

const userId = getUuid()

const seedEvents: DomainEvent[] = [
  FauxUtilisateurInscrit({
    userId,
    nom: 'John Doe',
  }),
]

export async function seed() {
  const events = await getHistory()

  if (events.length) {
    console.log('Seed: History is not empty. Nothing inserted.')
    return
  }

  console.log(`Seed: History is empty. Inserting ${seedEvents.length} seed events.`)

  for (const event of seedEvents) {
    await publish(event)
  }
}
