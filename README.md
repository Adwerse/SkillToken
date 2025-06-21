# SkillToken - Smart Contract for Skill Certificate Management

This project contains the `SkillToken` smart contract for managing skill certificates, written in Solidity, with a full set of tests in TypeScript.

## Functionality

SkillToken allows you to:
- The owner can add new certificates with a specified price and quantity
- Users can purchase certificates for ETH
- The owner can mark orders as delivered
- Retrieve a list of all available certificates
- Track the status of orders

## Installation

```bash
npm install
```

## Testing Commands

### Run tests with automatic coverage
```bash
npm test
```
This command runs the tests and then the code coverage analysis.

### Run tests only
```bash
npm run test-only
```

### Run coverage only
```bash
npm run coverage
```

### Other useful commands
```bash
# Compile the contract
npm run compile

# Clean artifacts
npm run clean

# Run a local Hardhat node
npm run node
```

## Test Structure

Tests are located in `test/SkillToken.test.ts` and cover:

### Main functions:
- ✅ Contract deployment
- ✅ Adding certificates (owner only)
- ✅ Purchasing certificates with price and quantity validation
- ✅ Order delivery (owner only)
- ✅ Retrieving the list of certificates

### Modifiers and security:
- ✅ Access restrictions (`onlyOwner`)
- ✅ Input validation
- ✅ Protection against direct ETH transfers
- ✅ Fallback function

### Events:
- ✅ `CertificateBought` on purchase
- ✅ `CertificateDelivered` on delivery

### Edge cases:
- ✅ Purchasing the last certificate
- ✅ Certificates with zero price
- ✅ Large quantities
- ✅ Empty strings in data
- ✅ Non-existent indexes

### Integration tests:
- ✅ Full cycle: add → purchase → deliver
- ✅ Multiple purchases and deliveries

## Code Coverage

After running `npm test` or `npm run coverage`, a coverage report will be generated:

- **SkillToken.sol**: 100% coverage of functions, lines, and branches
- Reports are saved in the `./coverage/` folder
- HTML report available at `./coverage/index.html`

## Last Test Results

```
  36 passing (431ms)

File                     |  % Stmts | % Branch |  % Funcs |  % Lines |
-------------------------|----------|----------|----------|----------|
 SkillToken.sol         |      100 |      100 |      100 |      100 |
```

## Test Architecture

### Fixtures:
- `deploySkillTokenFixture`: Basic contract deployment
- `deployWithCertificateFixture`: Deployment with a pre-installed certificate

### Test groups:
1. **Deployment** - checking correct initialization
2. **Adding certificates** - testing the `addCertificate` function
3. **Purchasing certificates** - testing the `buy` function
4. **Order delivery** - testing the `delivered` function
5. **Retrieving the list** - testing the `allCertificates` function
6. **Direct transfers** - testing `receive()` and fallback
7. **Integration tests** - complex scenarios
8. **Edge cases** - extreme values

## Automatic Run Setup

Thanks to the configuration in `package.json`, the `npm test` command automatically:
1. Runs all tests
2. Checks their success
3. If tests pass, runs coverage analysis
4. Generates a detailed report

This ensures maximum convenience for development and code quality control.

## Additional Files

- `.solcover.js` - configuration for solidity-coverage
- `hardhat.config.ts` - Hardhat settings with TypeScript and coverage support
- `typechain-types/` - automatically generated TypeScript types 