import { getCurrentGameConfig } from '../../../services/gameService';
import './Miniatures.scss';
import whoman from '../../../images/whoman.png';
import who_man from '../../../images/who_man.png';
import { useEffect, useState } from 'react';
import { useGlobalStorage } from '../../../services/storageService';

export default ({ charId, isUser, onClick }: { charId: string, isUser?: boolean, onClick?: () => void }) => {
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
        } else {
            setUrl(character.imageUrl);
            setName(character.name)
        }
    }, [charId])

    return <div className={`miniature-wrapper character-wrapper ${(usedCharacters[charId] && !isUser) ? 'used' : ''}`} onClick={onClick}>
        <div className='img-wrapper'>
            <img src={url} />
        </div>
        {(usedCharacters[charId] && !isUser) && <span>{usedCharacters[charId].name}</span>}
        {(isUser) && <span>{currentUser?.name}</span>}
        <span>{name}</span>
    </div>
}