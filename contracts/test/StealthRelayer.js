import { expect } from "chai";
import hre from "hardhat";

describe("StealthRelayer", function () {
  let stealthRelayer;
  let mockERC20;
  let owner;
  let alice;
  let bob;

  beforeEach(async function () {
    [owner, alice, bob] = await hre.ethers.getSigners();

    const StealthRelayer = await hre.ethers.getContractFactory("StealthRelayer");
    stealthRelayer = await StealthRelayer.deploy();

    const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20.deploy();
    
    // Give alice some mock tokens
    await mockERC20.connect(owner).transfer(alice.address, hre.ethers.parseEther("1000"));
  });

  it("Should send AVAX and emit event", async function () {
    const stealthAddress = hre.ethers.Wallet.createRandom().address;
    const ephemeralPubKey = hre.ethers.randomBytes(64); // mock pub key

    const amount = hre.ethers.parseEther("1.0");

    await expect(stealthRelayer.connect(alice).sendAVAX(stealthAddress, ephemeralPubKey, { value: amount }))
      .to.emit(stealthRelayer, "StealthPayment")
      .withArgs(stealthAddress, ephemeralPubKey, hre.ethers.ZeroAddress, amount);
      
    const balance = await hre.ethers.provider.getBalance(stealthAddress);
    expect(balance).to.equal(amount);
  });

  it("Should send ERC20 and emit event", async function () {
    const stealthAddress = hre.ethers.Wallet.createRandom().address;
    const ephemeralPubKey = hre.ethers.randomBytes(64);

    const amount = hre.ethers.parseEther("100");
    await mockERC20.connect(alice).approve(await stealthRelayer.getAddress(), amount);

    await expect(stealthRelayer.connect(alice).sendERC20(await mockERC20.getAddress(), stealthAddress, amount, ephemeralPubKey))
      .to.emit(stealthRelayer, "StealthPayment")
      .withArgs(stealthAddress, ephemeralPubKey, await mockERC20.getAddress(), amount);

    const balance = await mockERC20.balanceOf(stealthAddress);
    expect(balance).to.equal(amount);
  });
});
