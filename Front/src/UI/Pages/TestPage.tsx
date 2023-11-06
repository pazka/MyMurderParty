import AllObjects from "../Cheats/AllObjects"
import AllCharacters from "../Cheats/AllCharacters"
import UserInventoryObjects from "../Components/UserInventoryObjects"
import AllUsers from "../Cheats/AllUsers"
import AllRooms from "../Cheats/AllRooms"
import QrCodeReader from "../Components/QrCodeReader"
import { sendEvent } from "../../services/eventsService"
import { AvailableEvents } from "../../services/eventsService/allAvailableEvents"

export const TestPage = () => {
    return <div>
        <h1>Test Page</h1>
        <AllUsers />
        <AllRooms />
        <UserInventoryObjects onObjectClick={(o:InventoryItem)=>sendEvent(AvailableEvents.displayObject,o.id)} />
        <AllObjects readonly/>
        <AllCharacters />
    </div>
}