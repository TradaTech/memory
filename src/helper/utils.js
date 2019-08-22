import React from 'react';
import tweb3 from '../service/tweb3';
import ipfs from '../service/ipfs';
import moment from 'moment';
import * as bip39 from 'bip39';
import HDKey from 'hdkey';
import { ecc, codec, AccountType } from '@iceteachain/common';
import decode from './decode';
const paths = 'm’/44’/60’/0’/0';

export async function callPure(funcName, params) {
  const resp = await callReadOrPure(funcName, params, 'callPureContractMethod');
  if (resp) {
    return JSON.parse(resp);
  } else {
    return [];
  }
}
export async function callView(funcName, params) {
  const resp = await callReadOrPure(funcName, params, 'callReadonlyContractMethod');
  if (resp) {
    return JSON.parse(resp);
  } else {
    return [];
  }
}
async function callReadOrPure(funcName, params, method) {
  const address = process.env.contract;

  try {
    const result = await tweb3[method](address, funcName, params || []);
    return tryStringifyJson(result || '' + result);
  } catch (error) {
    console.log(tryStringifyJson(error, true));
  }
}

export async function sendTransaction(funcName, params) {
  // const { address } = this.props;
  console.log('params', params);
  try {
    const ct = tweb3.contract(process.env.contract);
    const result = await ct.methods[funcName](...(params || [])).sendCommit();
    return result;
  } catch (error) {
    console.log(error);
  }
}
export function tryStringifyJson(p, replacer = undefined, space = 2) {
  if (typeof p === 'string') {
    return p;
  }
  try {
    return '' + JSON.stringify(p, replacer, space);
  } catch (e) {
    return String(p);
  }
}

export async function getAccountInfo(address) {
  try {
    const info = await tweb3.getAccountInfo(address);
    return info;
  } catch (err) {
    throw err;
  }
}

export async function getTagsInfo(address) {
  const resp = await tweb3
    .contract('system.did')
    .methods.query(address)
    .call();
  if (resp) {
    const { tags } = resp;
    return tags;
  } else {
    return {};
  }
}

export async function saveToIpfs(files) {
  // const file = [...files][0];
  let ipfsId;
  // const fileDetails = {
  //   path: file.name,
  //   content: file,
  // };
  // const options = {
  //   wrapWithDirectory: true,
  //   progress: prog => console.log(`received: ${prog}`),
  // };
  // console.log('fileDetails', fileDetails);

  //ipfs
  //   .add(fileDetails, options)
  //   .then(response => {
  //     console.log(response);
  //     // CID of wrapping directory is returned last
  //     ipfsId = response[response.length - 1].hash;
  //     console.log(ipfsId);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //   });

  // upload usung file nam
  // const response = await ipfs.add(fileDetails, options);
  // ipfsId = response[response.length - 1].hash;
  // console.log(ipfsId);

  // simple upload
  await ipfs
    .add([...files], { progress: prog => console.log(`received: ${prog}`) })
    .then(response => {
      console.log(response);
      ipfsId = response[0].hash;
      console.log(ipfsId);
    })
    .catch(err => {
      console.error(err);
    });
  return ipfsId;
}

export function TimeWithFormat(props) {
  // console.log(props.value);
  const formatValue = props.format ? props.format : 'MM/DD/YYYY';
  return <span>{moment(props.value).format(formatValue)}</span>;
}

export async function isAliasRegisted(username) {
  try {
    const alias = 'account.'.concat(username);
    const info = await tweb3
      .contract('system.alias')
      .methods.resolve(alias)
      .call();
    return info;
  } catch (err) {
    console.log(tryStringifyJson(err));
    throw err;
  }
}
export async function getAlias(address) {
  try {
    let info = await tweb3
      .contract('system.alias')
      .methods.byAddress(address)
      .call();

    if (info) {
      info = info.split('.');
      info = info[1];
    }
    // console.log('info', info);
    return info;
  } catch (err) {
    console.log(tryStringifyJson(err));
    throw err;
  }
}
export async function registerAlias(username, address, privateKey) {
  try {
    tweb3.wallet.importAccount(privateKey);
    const info = await tweb3
      .contract('system.alias')
      .methods.register(username, address)
      .sendCommit({ from: address });
    return info;
  } catch (err) {
    console.log(tryStringifyJson(err));
    throw err;
  }
}
export const wallet = {
  createAccountWithMneomnic(mnemonic, index = 0) {
    if (!mnemonic) mnemonic = bip39.generateMnemonic();
    const privateKey = this.getPrivateKeyFromMnemonic(mnemonic, index);
    const { address } = ecc.toPubKeyAndAddress(privateKey);

    return {
      mnemonic,
      privateKey,
      address,
    };
  },
  recoverAccountFromMneomnic(mnemonic, options = { index: 0, type: AccountType.BANK_ACCOUNT }) {
    const typeTMP =
      options.type === AccountType.REGULAR_ACCOUNT ? AccountType.REGULAR_ACCOUNT : AccountType.BANK_ACCOUNT;
    let privateKey = '';
    let address = '';
    let indexBase = '';

    do {
      indexBase = options.index;
      privateKey = this.getPrivateKeyFromMnemonic(mnemonic, options.index);
      ({ address } = ecc.toPubKeyAndAddress(privateKey));
      options.index += 1;
      // console.log('index', options.index);
    } while (options.index < 100 && !codec.isAddressType(address, typeTMP));

    return {
      privateKey,
      address,
      index: indexBase,
    };
  },

  getPrivateKeyFromMnemonic(mnemonic, index = 0) {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('wrong mnemonic format');
    }

    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const childkey = hdkey.derive(paths + index);

    return codec.toKeyString(childkey.privateKey);
  },

  recoverAccountFromPrivateKey(keyStore, password, address) {
    const privateKey = this.getPrivateKeyFromKeyStore(keyStore, password);
    if (this.getAddressFromPrivateKey(privateKey) !== address) {
      throw new Error('wrong password');
    }
    return privateKey;
  },

  getPrivateKeyFromKeyStore(keyStore, password) {
    const account = decode(password, keyStore);
    const privateKey = codec.toString(account.privateKey);
    return privateKey;
  },

  getAddressFromPrivateKey(privateKey) {
    const { address } = ecc.toPubKeyAndAddressBuffer(privateKey);
    return address;
  },

  // encryptMnemonic(mnemonic, password) {
  //   const options = {
  //     kdf: 'pbkdf2',
  //     cipher: 'aes-128-ctr',
  //     kdfparams: {
  //       c: 262144,
  //       dklen: 32,
  //       prf: 'hmac-sha256',
  //     },
  //     noAddress: true,
  //   };

  //   const dk = keythereum.create();
  //   return keythereum.dump(password, mnemonic, dk.salt, dk.iv, options);
  // },

  // decryptMnemonic(mnemonicObj, password) {
  //   // type uint8array
  //   const mnemonic = keythereum.recover(password, mnemonicObj);
  //   return new TextDecoder('utf-8').decode(mnemonic).replace(/%20/g, ' ');
  // },
};