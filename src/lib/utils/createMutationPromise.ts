import type { ActorRef, EventObject, MachineSnapshot } from 'xstate'

export function createMutationPromise<
  TSnapshot extends MachineSnapshot<any, any, any, any, any, any, any, any>,
  TEvent extends EventObject
>(event: TEvent, actor: ActorRef<TSnapshot, TEvent>): Promise<TSnapshot> {
  return new Promise(resolve => {
    let isInitialEmission = true
    const subscription = actor.subscribe(snapshot => {
      if (isInitialEmission) {
        isInitialEmission = false
        return
      }
      if (snapshot.matches('idle')) {
        subscription.unsubscribe()
        resolve(snapshot)
      }
    })
    actor.send(event)
  })
}
