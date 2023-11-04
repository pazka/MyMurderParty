import AllObjects from "../Cheats/AllObjects"
import AllCharacters from "../Cheats/AllCharacters"
import UserInventory from "../Components/UserInventory"
import AllUsers from "../Cheats/AllUsers"
import AllRooms from "../Cheats/AllRooms"

export const TestPage = () => {
    return <div>
        <h1>Test Page</h1>
        <AllUsers />
        <AllRooms />
        <UserInventory />
        <AllObjects />
        <AllCharacters />
    </div>
}