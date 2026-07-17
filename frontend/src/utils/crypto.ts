import EthCrypto from 'eth-crypto';

export const generateKeyPair = () => {
  const identity = EthCrypto.createIdentity();
  return {
    privateKey: identity.privateKey,
    publicKey: identity.publicKey,
    address: identity.address
  };
};

export const encryptMessage = async (publicKey: string, message: string) => {
  const encrypted = await EthCrypto.encryptWithPublicKey(publicKey, message);
  return EthCrypto.cipher.stringify(encrypted);
};

export const decryptMessage = async (privateKey: string, encryptedMessage: string) => {
  const encryptedObject = EthCrypto.cipher.parse(encryptedMessage);
  const decrypted = await EthCrypto.decryptWithPrivateKey(privateKey, encryptedObject);
  return decrypted;
};
