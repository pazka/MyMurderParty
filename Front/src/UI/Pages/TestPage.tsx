import AllObjects from "../Cheats/AllObjects"
import AllCharacters from "../Cheats/AllCharacters"
import UserInventory from "../Components/UserInventory"
import AllUsers from "../Cheats/AllUsers"
import AllRooms from "../Cheats/AllRooms"
import QrCodeReader from "../Components/QrCodeReader"

export const TestPage = () => {
    return <div>
        <h1>Test Page</h1>
        <AllUsers />
        <AllRooms />
        <UserInventory />
        <AllObjects />
        <AllCharacters />
        <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
        }}>
                <QrCodeReader />
        </div>
    </div>
}