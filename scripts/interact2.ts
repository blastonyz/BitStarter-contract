import { ethers } from "ethers";
import VotingJson from "../artifacts/contracts/CrowdVotingToken.sol/CrowdVotingToken.json"
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.MOONBASE_URL);
    const wallet = new ethers.Wallet(process.env.MOON_PRIVATE_KEY!, provider);
    const user1 = new ethers.Wallet(process.env.MOON_PRIVATE_KEY2!, provider);
    const user2 = new ethers.Wallet(process.env.MOON_PRIVATE_KEY3!, provider);
    const contributor = new ethers.Wallet(process.env.MOON_PRIVATE_KEY4!, provider);
    // 2. Preparamos y desplegamos el contrato

    const stakeholders = [wallet.address, user1.address, user2.address];

    const deployedAddress = "0xE70481003c0968E3C5D070970Ca2d7AF77f33bA7";

    // Solo ABI, NO bytecode
    const cvt = new ethers.Contract(deployedAddress, VotingJson.abi, wallet);
    // Transferir tokens al contributor
    await (await cvt.transfer(contributor.address, ethers.parseEther("500"))).wait();
    console.log("Tokens enviados al contributor");

    // Crear proyecto
    const milestoneDescriptions = ["M1 diseño", "M2 desarrollo"];
    const milestoneAmounts = [ethers.parseEther("100"), ethers.parseEther("150")];

    const txCreate = await cvt.createProject(
        "Proyecto Demo",
        ethers.parseEther("250"),
        milestoneDescriptions,
        milestoneAmounts
    );
    const receiptCreate = await txCreate.wait();
    const projectId = receiptCreate.logs[0].args[0];
    console.log("Proyecto creado ID:", projectId.toString());

    // Contribuir
    await cvt.connect(user1).approve(cvt.getAddress(), ethers.parseEther("100"));
    await cvt.connect(user1).contribute(projectId, ethers.parseEther("100"));

    console.log("Contribución realizada");

    // Stakeholders votan milestone 0
    await (await cvt.connect(wallet).voteMilestone(projectId, 0)).wait();
    await (await cvt.connect(user1).voteMilestone(projectId, 0)).wait();
    console.log("Votación completada");

    // Consultar votos y balance del creador
    const [votes, voters] = await cvt.getMilestoneVotes(projectId, 0);
    console.log("Votos:", votes.toString(), "Votantes:", voters);

    const creatorBalance = await cvt.balanceOf(wallet.address);
    console.log("Balance del creador:", ethers.formatEther(creatorBalance));

}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
