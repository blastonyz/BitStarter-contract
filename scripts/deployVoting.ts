import { ethers } from "ethers"
import VotingJson from "../artifacts/contracts/CrowdVotingToken.sol/CrowdVotingToken.json"

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.MOONBASE_URL);
    const wallet = new ethers.Wallet(process.env.MOON_PRIVATE_KEY!, provider)
    const user1 = new ethers.Wallet(process.env.MOON_PRIVATE_KEY2!, provider);
    const user2 = new ethers.Wallet(process.env.MOON_PRIVATE_KEY3!, provider);


    const votingFactory = new ethers.ContractFactory(
        VotingJson.abi,
        VotingJson.bytecode,
        wallet
    )

    const voting = await votingFactory.deploy([
        wallet.address,
        user1.address,
        user2.address
    ])

    await voting.waitForDeployment()
    const address = await voting.getAddress()
    console.log("✅ Governor deployed at:", address);
}


main().catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
});