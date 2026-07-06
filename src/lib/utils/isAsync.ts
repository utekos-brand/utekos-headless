/**
 * Checks if a function is asynchronous.
 *
 * @param fn - The function to check.
 * @returns `true` if the function is asynchronous, `false` otherwise.
 */

type VitestMock = {
  getMockImplementation: () =>
    | ((...args: unknown[]) => unknown)
    | undefined
}

function resolveVitestMockImplementation(fn: unknown): unknown {
  if (
    typeof fn !== 'function' ||
    !('getMockImplementation' in fn)
  ) {
    return fn
  }

  const mock = fn as VitestMock
  return mock.getMockImplementation() ?? fn
}

export function isAsync(fn: unknown): boolean {
  fn = resolveVitestMockImplementation(fn)

  const firstCheck = fn instanceof (async () => null).constructor
  const secondCheck = fn?.constructor?.name === 'AsyncFunction'

  if (firstCheck !== secondCheck) {
    // Defensive fallback: if the two checks disagree (e.g. due to
    // transpilation or bundler quirks), err on the side of treating
    // the function as async.
    return true
  }

  // is async function transpiled using @babel/plugin-transform-async-to-generator
  const isAsyncFunctionBabelTranspiled = fn
    ?.toString()
    ?.trim()
    ?.match(/return _ref[^.]*\.apply/)

  if (isAsyncFunctionBabelTranspiled) {
    return true
  }
  return firstCheck
}
