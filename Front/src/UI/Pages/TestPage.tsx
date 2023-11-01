import { AllObjects } from "../Cheats/AllObjects"
import { AllCharacters } from "../Cheats/AllUser"
import { TestKeys } from "../Components/TestKeys"
import { TestNoKeys } from "../Components/TestNoKeys"
import { UserInventory } from "../Components/UserInventory"

export const TestPage = () => {
    return <>
        <h1>Test Page</h1>
        <UserInventory />
        <TestKeys />
        <TestNoKeys />
        <AllObjects />
        <AllCharacters />
    </>
}