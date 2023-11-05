import * as defaultEngine from './default';

const allEngines : { [id: string]: GameEngine } = {
    [defaultEngine.ENGINE_NAME] : defaultEngine
}

export default allEngines;