const { assert } = require("chai")
const { ethers, deployments, getNamedAccounts } = require("hardhat")

describe("FundMe Contract Test", function () {
    let fundMe
    let deployer

    // 在每个测试用例之前部署一个新的FundMe合约实例
    beforeEach(async function () {
        // 用 tags 的方式部署合约，运行 npx hardhat deploy --tags fundMe 就会执行这个部署脚本
        await deployments.fixture(["fundMe"])
        // 获取部署者账户地址
        deployer = (await getNamedAccounts()).firstAccount
        // 获取部署的 FundMe 合约实例
        const fundMeDeployment = await deployments.get("FundMe")
        const deployerSigner = await ethers.getSigner(deployer)
        fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, deployerSigner)
    })

    // Test cases will go here
    it("should the owner must be msg.sender", async function () {
        // 通过合约工厂部署fundMe合约
        // const FundMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await FundMeFactory.deploy(600)
        // await fundMe.waitForDeployment()

        // 获取部署合约的地址
        const deployerAddress = await fundMe.owner()
        // const [account1] = await ethers.getSigners()

        // 断言部署者地址和msg.sender地址相同
        assert.equal(deployerAddress, deployer, "Owner should be the deployer")
    })

});