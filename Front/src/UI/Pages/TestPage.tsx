import AllObjects from "../Cheats/AllObjects"
import AllCharacters from "../Cheats/AllCharacters"
import UserInventoryObjects from "../Components/UserInventoryObjects"
import AllUsers from "../Cheats/AllUsers"
import AllRooms from "../Cheats/AllRooms"
import QrCodeReader from "../Components/QrCodeReader"
import { sendEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"

import { openPopUp } from "../../services/utils"
import { enqueueSnackbar } from "notistack"

const testSendEvent = () => {
    openPopUp({
            message: `## test

____
another test

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nunc aliquam nunc, vitae aliqu 
qsdLorem ipsum dolor sit amet, **consectetur adipiscing elit**. Nullam euismod, nisl eget ultricies ultrices, nun`,
            variant: ["info", "success", "error", "warning", "magic"][Math.floor(Math.random() * 5)],
            confirmCallback: (x: any) => x,
            cancelCallback: (x: any) => x,
        }
    )
}

const testNotistack = () => {
    enqueueSnackbar("test", { variant: ["info", "success", "error", "warning"][Math.floor(Math.random() * 4)] as any })
}

export const TestPage = () => {
    return <div>
        <h1>Test Page</h1>
        <AllUsers />
        <AllRooms />
        <UserInventoryObjects onObjectClick={(o: InventoryItem) => sendEvent(AvailableEvents.displayObject, o.id)} />
        <AllObjects readonly />
        <AllCharacters />
        <button onClick={testSendEvent}> Display PopUp</button>
        <button onClick={testNotistack}> Display Notistack</button>
    </div >
}