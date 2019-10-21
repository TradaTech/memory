import React, { useEffect, useState } from 'react';
import { codec } from '@iceteachain/common';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import { useSnackbar } from 'notistack';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';

import { wallet, savetoLocalStorage } from '../../../../helper';
import { ButtonPro } from '../../../elements/Button';
import * as actionGlobal from '../../../../store/actions/globalData';
import * as actionAccount from '../../../../store/actions/account';
import * as actionCreate from '../../../../store/actions/create';
import tweb3 from '../../../../service/tweb3';
import { DivControlBtnKeystore } from '../../../elements/StyledUtils';

import { encode } from '../../../../helper/encode';

const styles = theme => ({
  // button: {
  //   margin: theme.spacing(1),
  //   background: 'linear-gradient(332deg, #b276ff, #fe8dc3)',
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    borderWidth: '1px',
    borderColor: 'yellow !important',
  },
});

function ByMnemonic(props) {
  const { setLoading, setAccount, setStep, history } = props;
  const [isPrivateKey, setIsPrivateKey] = useState(false);
  const [password, setPassword] = useState('');
  const [valueInput, setValueInput] = useState('');
  const [rePassErr] = useState('');
  const [isRemember, setIsRemember] = useState(true);

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleUserKeyPress = event => {
      if (event.keyCode === 13) {
        gotoLogin();
      }
    };
    window.document.body.addEventListener('keydown', handleUserKeyPress);
    return () => {
      window.document.body.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);

  async function gotoLogin() {
    let message = '';
    if (!valueInput) {
      message = `Please input recovery phrase or key.`;
      enqueueSnackbar(message, { variant: 'error' });
      return;
    }
    setLoading(true);
    setTimeout(async () => {
      try {
        let privateKey = '';
        if (isPrivateKey) {
          privateKey = valueInput;
        } else {
          privateKey = wallet.getPrivateKeyFromMnemonic(valueInput);
        }
        // console.log('getAddressFromPrivateKey', privateKey);
        const address = wallet.getAddressFromPrivateKey(privateKey);
        const acc = tweb3.wallet.importAccount(privateKey);
        // tweb3.wallet.defaultAccount = address;

        // check if account is a regular address
        if (!tweb3.utils.isRegularAccount(acc.address)) {
          throw new Error(
            'The recovery phrase is for a bank account. LoveLock only accepts regular (non-bank) account.'
          );
        }
        const token = tweb3.wallet.createRegularAccount();
        const ms = tweb3.contract('system.did').methods;
        const expire = isRemember ? process.env.REACT_APP_TIME_EXPIRE : process.env.REACT_APP_DEFAULT_TIME_EXPIRE;

        ms.grantAccessToken(
          address,
          [process.env.REACT_APP_CONTRACT, 'system.did'],
          token.address,
          parseInt(expire, 10)
        )
          .sendCommit({ from: address })
          .then(({ returnValue }) => {
            tweb3.wallet.importAccount(token.privateKey);
            const keyObject = encode(privateKey, password);
            const storage = isRemember ? localStorage : sessionStorage;
            // save token account
            storage.sessionData = codec
              .encode({
                contract: process.env.REACT_APP_CONTRACT,
                tokenAddress: token.address,
                tokenKey: token.privateKey,
                expireAfter: returnValue,
              })
              .toString('base64');
            // save main account
            savetoLocalStorage(address, keyObject);
            const account = {
              address,
              privateKey,
              tokenAddress: token.address,
              tokenKey: token.privateKey,
              cipher: password,
              encryptedData: keyObject,
            };
            setAccount(account);
            setLoading(false);
            history.push('/');
          });
      } catch (error) {
        console.error(error);
        message = `An error occurred, please try again later`;
        enqueueSnackbar(message, { variant: 'error' });
        setLoading(false);
      }
      // setLoading(false);
    }, 100);
  }

  function handlePassword(event) {
    const { value } = event.target;
    setPassword(value);
  }

  function handleMnemonic(event) {
    const value = event.target.value.trim();
    if (value.indexOf(' ') < 0) {
      setIsPrivateKey(true);
    }
    setValueInput(value);
  }

  function loginWithPrivatekey() {
    let user = localStorage.getItem('user') || sessionStorage.getItem('user');
    user = (user && JSON.parse(user)) || {};
    const addr = user.address;
    if (addr) {
      setStep('one');
    } else history.goBack();
  }

  return (
    <div>
      <TextField
        id="outlined-multiline-static"
        label="Recovery phrase or key"
        placeholder="Enter your Recovery phrase or key"
        multiline
        rows="4"
        onChange={handleMnemonic}
        margin="normal"
        variant="outlined"
        fullWidth
        helperText={rePassErr}
        error={rePassErr !== ''}
        autoFocus
      />
      <TextField
        id="rePassword"
        label="New Password"
        placeholder="Enter your password"
        helperText={rePassErr}
        error={rePassErr !== ''}
        fullWidth
        margin="normal"
        onChange={handlePassword}
        type="password"
      />
      <FormControlLabel
        control={
          <Checkbox
            icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
            checkedIcon={<CheckBoxIcon fontSize="small" />}
            value={isRemember}
            checked={isRemember}
            color="primary"
            onChange={() => setIsRemember(!isRemember)}
          />
        }
        label="Remember me for 30 days"
      />
      <DivControlBtnKeystore>
        <ButtonPro color="primary" onClick={loginWithPrivatekey}>
          Back
        </ButtonPro>
        <ButtonPro variant="contained" color="primary" onClick={gotoLogin}>
          Recover
        </ButtonPro>
      </DivControlBtnKeystore>
    </div>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    setAccount: value => {
      dispatch(actionAccount.setAccount(value));
    },
    setStep: value => {
      dispatch(actionCreate.setStep(value));
    },
    setLoading: value => {
      dispatch(actionGlobal.setLoading(value));
    },
  };
};

export default withStyles(styles)(
  connect(
    null,
    mapDispatchToProps
  )(withRouter(ByMnemonic))
);
