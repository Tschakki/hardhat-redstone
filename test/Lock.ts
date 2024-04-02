import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";
import { WrapperBuilder } from "@redstone-finance/evm-connector";
import { SimpleNumericMockWrapper } from "@redstone-finance/evm-connector/dist/src/wrappers/SimpleMockNumericWrapper";
import { Contract, ContractFactory } from "ethers";

//import { Contract } from "ethers";


describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    //const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;
    const unlockTime = 1893456000;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const Lock = await hre.ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount, Lock };
  }

  describe("Deployment", function () {

    it("Should set the right unlockTime", async function () {
      const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { lock, owner } = await loadFixture(deployOneYearLockFixture);

      expect(await lock.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to lock", async function () {
      const { lock, lockedAmount } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await hre.ethers.provider.getBalance(lock.target)).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const Lock = await hre.ethers.getContractFactory("Lock");
      await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlock time should be in the future"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { lock } = await loadFixture(deployOneYearLockFixture);

        await expect(lock.withdraw()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use lock.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(
          deployOneYearLockFixture
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Redstone", function () {

      /* let contract: Lock;

      beforeEach(async () => {
        // Deploy contract
        const LockContract = await hre.ethers.getContractFactory("Lock");
        contract = await LockContract.deploy(1893456000);
      }); */

      it("Get ETH price securely", async function () {
        //const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);
        /* const address = "0x08e81Fc05C9c9DEEAA0c9FA49E9475669fCC48Dd";
        const abi = [
          {
              "inputs": [
                  {
                      "internalType": "uint256",
                      "name": "_unlockTime",
                      "type": "uint256"
                  }
              ],
              "stateMutability": "payable",
              "type": "constructor"
          },
          {
              "inputs": [],
              "name": "CalldataMustHaveValidPayload",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "CalldataOverOrUnderFlow",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "CanNotPickMedianOfEmptyArray",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "DataPackageTimestampMustNotBeZero",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "DataPackageTimestampsMustBeEqual",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "EachSignerMustProvideTheSameValue",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "EmptyCalldataPointersArr",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "GetDataServiceIdNotImplemented",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "IncorrectUnsignedMetadataSize",
              "type": "error"
          },
          {
              "inputs": [
                  {
                      "internalType": "uint256",
                      "name": "receivedSignersCount",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "requiredSignersCount",
                      "type": "uint256"
                  }
              ],
              "name": "InsufficientNumberOfUniqueSigners",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "InvalidCalldataPointer",
              "type": "error"
          },
          {
              "inputs": [],
              "name": "RedstonePayloadMustHaveAtLeastOneDataPackage",
              "type": "error"
          },
          {
              "inputs": [
                  {
                      "internalType": "address",
                      "name": "receivedSigner",
                      "type": "address"
                  }
              ],
              "name": "SignerNotAuthorised",
              "type": "error"
          },
          {
              "inputs": [
                  {
                      "internalType": "uint256",
                      "name": "receivedTimestampSeconds",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "blockTimestamp",
                      "type": "uint256"
                  }
              ],
              "name": "TimestampFromTooLongFuture",
              "type": "error"
          },
          {
              "inputs": [
                  {
                      "internalType": "uint256",
                      "name": "receivedTimestampSeconds",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "blockTimestamp",
                      "type": "uint256"
                  }
              ],
              "name": "TimestampIsTooOld",
              "type": "error"
          },
          {
              "anonymous": false,
              "inputs": [
                  {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                  },
                  {
                      "indexed": false,
                      "internalType": "uint256",
                      "name": "when",
                      "type": "uint256"
                  }
              ],
              "name": "Withdrawal",
              "type": "event"
          },
          {
              "inputs": [
                  {
                      "internalType": "uint256[]",
                      "name": "values",
                      "type": "uint256[]"
                  }
              ],
              "name": "aggregateValues",
              "outputs": [
                  {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "extractTimestampsAndAssertAllAreEqual",
              "outputs": [
                  {
                      "internalType": "uint256",
                      "name": "extractedTimestamp",
                      "type": "uint256"
                  }
              ],
              "stateMutability": "pure",
              "type": "function"
          },
          {
              "inputs": [
                  {
                      "internalType": "address",
                      "name": "signerAddress",
                      "type": "address"
                  }
              ],
              "name": "getAuthorisedSignerIndex",
              "outputs": [
                  {
                      "internalType": "uint8",
                      "name": "",
                      "type": "uint8"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "getDataServiceId",
              "outputs": [
                  {
                      "internalType": "string",
                      "name": "",
                      "type": "string"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "getLatestEthPrice",
              "outputs": [
                  {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "getUniqueSignersThreshold",
              "outputs": [
                  {
                      "internalType": "uint8",
                      "name": "",
                      "type": "uint8"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "owner",
              "outputs": [
                  {
                      "internalType": "address payable",
                      "name": "",
                      "type": "address"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "unlockTime",
              "outputs": [
                  {
                      "internalType": "uint256",
                      "name": "",
                      "type": "uint256"
                  }
              ],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [
                  {
                      "internalType": "uint256",
                      "name": "receivedTimestampMilliseconds",
                      "type": "uint256"
                  }
              ],
              "name": "validateTimestamp",
              "outputs": [],
              "stateMutability": "view",
              "type": "function"
          },
          {
              "inputs": [],
              "name": "withdraw",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
          }
      ];
        const url = 'https://rpc.sepolia-api.lisk.com';
        const provider = new hre.ethers.JsonRpcProvider(url);
        const yourEthersContract = new hre.ethers.Contract(address, abi, provider); */
        // Wrapping the contract
        /* const wrappedContract =
          WrapperBuilder.wrap(yourEthersContract).usingSimpleNumericMock(
            {
              mockSignersCount: 10,
              dataPoints: [
                {dataFeedId: "ETH", value: 1000}
              ],
            },
          ); */
        const LockContract = await hre.ethers.getContractFactory("Lock");
        const contract = await LockContract.deploy(1896456000);
        const wrappedContract = WrapperBuilder.wrap(contract).usingDataService({
          dataFeeds: ["ETH"],
        });

        // Interact with the contract (getting oracle value securely)
        const ethPriceFromContract = await wrappedContract.getLatestEthPrice();
        console.log({ ethPriceFromContract });
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});
