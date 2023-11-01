import AllObjects from "../Cheats/AllObjects"
import AllCharacters from "../Cheats/AllCharacters"
import UserInventory from "../Components/UserInventory"
import AllUsers from "../Cheats/AllUsers"

export const TestPage = () => {
    return <div>
        <h1>Test Page</h1>
        <AllUsers />
        <UserInventory />
        <AllObjects />
        <AllCharacters />
    </div>
}