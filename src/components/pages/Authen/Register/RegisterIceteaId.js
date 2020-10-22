import React, { useEffect } from 'react';
import QueueAnim from 'rc-queue-anim';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { LayoutAuthen, BoxAuthen, ShadowBoxAuthen } from '../../../elements/StyledUtils';
import { HeaderAuthen } from '../../../elements/Common';
import * as actionCreate from '../../../../store/actions/create';
import { ButtonPro, ButtonGoogle } from '../../../elements/Button';
import { IceteaId } from 'iceteaid-web';
import Otp from '../Otp';
import RegisterSuccess from './RegisterSuccess';

const i = new IceteaId('xxx');

const DivActionButton = styled.div`
  margin: 15px 0 15px 0;
`;

const OrParagraph = styled.div`
  margin-bottom: 16px;
  margin-top: 16px;
  overflow: hidden;
  text-align: center;
  font-size: 14px;
  color: rgb(51, 51, 51);
  font-weight: bold;
`;

export default function RegisterIceteaId() {
  const dispatch = useDispatch();
  const step = useSelector((state) => state.create.step);

  return (
    <>
      {step === 'five' && (
        <QueueAnim delay={200} type={['top', 'bottom']}>
          <LayoutAuthen key={1}>
            <BoxAuthen>
              <ShadowBoxAuthen>
                <>
                  <RegisterSuccess />
                </>
              </ShadowBoxAuthen>
            </BoxAuthen>
          </LayoutAuthen>
        </QueueAnim>
      )}
    </>
  );
}