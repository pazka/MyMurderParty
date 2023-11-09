import { getCurrentGameConfig } from '../../../services/gameService';
import './Miniatures.scss';
import whoman from '../../../images/whoman.jpg';
import who_man from '../../../images/who_man.jpg';
import { useEffect, useState } from 'react';
import { useGlobalStorage } from '../../../services/storageService';

export default ({ charId, isUser }: { charId: string, isUser?: boolean }) => {
    const gameConfig = getCurrentGameConfig();
    const character = gameConfig.TROMBINOSCOPE[charId];
    const [storage] = useGlobalStorage();
    const currentUser = storage.currentUser;
    const usedCharacters = storage.currentRoom?.characters ?? {};

    const [url, setUrl] = useState<string | undefined>(character?.imageUrl);
    const [name, setName] = useState<string | undefined>(character?.name);

    useEffect(() => {
        if (!character) {
            setUrl(Math.random() > 0.5 ? whoman : who_man);
            setName('No Character selected')
        }
    }, [])

    return <div className='miniature-wrapper character-wrapper'>
        <div className='img-wrapper'>
            <img src={url} />
            <div className="shadow"></div>
        </div>
        {usedCharacters[charId] && <span>{usedCharacters[charId].name}</span>}
        <span>{name}</span>
    </div>
}