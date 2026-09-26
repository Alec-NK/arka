import { describe, expect, it } from 'vitest';
import { reconcileDraft } from './reconcile-draft';
describe('reconcileDraft', () => {
  it('preserves a user edit when the same field changed on the server', () => {
    expect(reconcileDraft({ name: 'Original', amount: '10' }, { name: 'Meu rascunho', amount: '10' }, { name: 'Outra pessoa', amount: '20' })).toEqual({ values: { name: 'Meu rascunho', amount: '20' }, changed: ['name', 'amount'] });
  });
  it('keeps an intentional cleared optional field and selected supplier', () => {
    expect(reconcileDraft({ supplierId: 'old', notes: 'Original' }, { supplierId: 'created-inline', notes: '' }, { supplierId: 'server', notes: 'Servidor' }).values).toEqual({ supplierId: 'created-inline', notes: '' });
  });
  it('adopts server changes when the user has not edited the fields', () => {
    expect(reconcileDraft({ name: 'Original', supplierId: null }, { name: 'Original', supplierId: null }, { name: 'Atualizado', supplierId: 'new' })).toEqual({ values: { name: 'Atualizado', supplierId: 'new' }, changed: ['name', 'supplierId'] });
  });
});
