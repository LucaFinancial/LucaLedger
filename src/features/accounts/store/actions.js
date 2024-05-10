import { EntityTypeEnum } from '@/store/enums';
import { actions } from '@/store/entities';

export const createNewAccount = (name, description) => (dispatch) => {
  dispatch(actions.createNewEntity(EntityTypeEnum.ACCOUNT, name, description));
};

export const closeAccountById = (id) => (dispatch) => {
  dispatch(actions.updateEntityById(id, EntityTypeEnum.CLOSED));
};
