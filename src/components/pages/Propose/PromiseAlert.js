import React from 'react';
import styled from 'styled-components';
import { withSnackbar } from 'notistack';
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia } from '@material-ui/core';
import CommonDialog from './CommonDialog';
import { TagTitle } from './Promise';
import { getAlias, sendTransaction } from '../../../helper';

export const ipfs = process.env.REACT_APP_IPFS;

const ImgView = styled.div`
  margin: 20px 0 20px;
`;

const PageView = styled.div`
  font-family: Montserrat;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-height: 16px;
  -webkit-line-clamp: 4; /* Write the number of lines you want to be displayed */
  -webkit-box-orient: vertical;
`;

const useStyles = makeStyles(theme => ({
  media: {
    height: 350,
    position: 'relative',
    overflow: 'hidden',
    backgroundSize: 'contain',
  },
}));

function CardMediaCus(props) {
  const classes = useStyles();
  return <CardMedia className={classes.media} {...props} />;
}

class PromiseAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sender: '',
      info: '',
      content: '',
      name: '',
    };
  }

  componentDidMount() {
    this.loaddata();
  }

  async loaddata() {
    const { propose, address } = this.props;
    const { index } = this.props;

    const obj = propose.filter(item => item.id === index)[0];
    // console.log('loaddata', obj);
    if (obj.status === 0) {
      const addr = address === obj.sender ? obj.receiver : obj.sender;
      // const reps = await getTagsInfo(addr);
      const name = await getAlias(addr);
      // obj.name = name;
      this.setState({
        sender: obj.sender,
        name,
        info: obj.s_info,
        content: obj.s_content,
      });
    }
  }

  async cancelPromise(index) {
    // console.log('index', index);
    const { enqueueSnackbar, close } = this.props;
    try {
      const name = 'cancelPropose';
      const params = [index, 'no'];
      const result = await sendTransaction(name, params);
      // console.log('View result', result);
      if (result) {
        // window.alert('Success');
        const message = 'Your propose has been removed.';
        enqueueSnackbar(message, { variant: 'info' });
        close();
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { deny, close, accept, address, index } = this.props;
    const { sender, info, content, name } = this.state;
    const infoParse = info && JSON.parse(info);
    const hash = (infoParse && infoParse.hash) || '';
    // console.log('infoParse', infoParse);
    // console.log('view state', this.state);
    return (
      <div>
        {address === sender ? (
          <CommonDialog
            title="Promise alert"
            okText="Cancel Promise"
            close={close}
            confirm={() => {
              this.cancelPromise(index);
            }}
          >
            <TagTitle>
              <span>You sent promise to </span>
              <span className="highlight">{name}</span>
            </TagTitle>
            <ImgView>{hash && <CardMediaCus image={process.env.REACT_APP_IPFS + hash} title="promiseImg" />}</ImgView>
            <PageView>{content}</PageView>
          </CommonDialog>
        ) : (
          <CommonDialog
            title="Promise alert"
            okText="Accept"
            cancelText="Deny"
            close={close}
            cancel={deny}
            confirm={accept}
            isCancel
          >
            <TagTitle>
              <span className="highlight">{name}</span>
              <span> sent a promise to you</span>
            </TagTitle>
            <ImgView>{hash && <CardMediaCus image={process.env.REACT_APP_IPFS + hash} title="promiseImg" />}</ImgView>
            <PageView>{content}</PageView>
          </CommonDialog>
        )}
      </div>
    );
  }
}

PromiseAlert.defaultProps = {
  index: 0,
  deny() {},
  accept() {},
  close() {},
};

export default withSnackbar(PromiseAlert);
