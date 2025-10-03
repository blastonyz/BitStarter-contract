import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();


const config: HardhatUserConfig & {
  etherscan: {
    apiKey: Record<string, string>;
    customChains: {
      network: string;
      chainId: number;
      urls: {
        apiURL: string;
        browserURL: string;
      };
    }[];
  };
} = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    alpha: {
      type: "http",
      url: process.env.MOONBASE_URL!,
      accounts: [`0x${process.env.MOON_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: process.env.ETHERSCAN_V2_API_KEY!,
    },
    customChains: [
      {
        network: "moonbaseAlpha",
        chainId: 1287,
        urls: {
          apiURL: "https://api-moonbase.moonscan.io/api",
          browserURL: "https://moonbase.moonscan.io",
        },
      },
    ],
  },
};


export default config;