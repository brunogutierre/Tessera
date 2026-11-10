import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { userEvent } from 'vitest/browser';
import { loadTesseraStyles } from '../../test-utils/styles';
import { TesTree } from './tree';
import type { TesTreeNode } from './tree';

const FOLDERS: TesTreeNode[] = [
  {
    value: 'finance',
    label: 'Finance',
    icon: 'folder',
    expanded: true,
    children: [
      { value: 'invoices', label: 'Invoices', icon: 'file' },
      { value: 'payroll', label: 'Payroll', icon: 'file', disabled: true },
    ],
  },
  {
    value: 'legal',
    label: 'Legal',
    icon: 'folder',
    children: [{ value: 'contracts', label: 'Contracts', icon: 'file' }],
  },
  { value: 'readme', label: 'Read me', icon: 'file' },
];

@Component({
  imports: [TesTree],
  template: `<tes-tree label="Documents" [nodes]="folders" [(value)]="selected" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly folders = FOLDERS;
  readonly selected = signal<readonly string[]>([]);
}

async function render() {
  const fixture = TestBed.createComponent(Host);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const item = (name: string) =>
    el.querySelector<HTMLElement>(`[role="treeitem"][aria-label="${name}"]`)!;
  const settle = () => fixture.whenStable();
  return { fixture, host: fixture.componentInstance, el, item, settle };
}

beforeAll(loadTesseraStyles);

describe('TesTree', () => {
  it('renders a named tree with levels, sizes and positions', async () => {
    const { el, item } = await render();
    expect(el.querySelector('[role="tree"]')!.getAttribute('aria-label')).toBe('Documents');
    expect(item('Finance').getAttribute('aria-level')).toBe('1');
    expect(item('Finance').getAttribute('aria-expanded')).toBe('true');
    expect(item('Invoices').getAttribute('aria-level')).toBe('2');
    expect(item('Invoices').getAttribute('aria-posinset')).toBe('1');
    expect(item('Invoices').getAttribute('aria-setsize')).toBe('2');
    expect(item('Legal').getAttribute('aria-expanded')).toBe('false');
    expect(item('Read me').hasAttribute('aria-expanded')).toBe(false);
  });

  it('expands with Right, collapses with Left and moves with Up and Down', async () => {
    const { item, settle } = await render();
    item('Finance').focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await settle();
    // Payroll is disabled and skipped.
    expect(document.activeElement).toBe(item('Legal'));
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(item('Legal').getAttribute('aria-expanded')).toBe('true');
    await userEvent.keyboard('{ArrowRight}');
    await settle();
    expect(document.activeElement).toBe(item('Contracts'));
    await userEvent.keyboard('{ArrowLeft}');
    await settle();
    expect(document.activeElement).toBe(item('Legal'));
  });

  it('selects with Enter and click, and hides collapsed groups', async () => {
    const { item, host, settle } = await render();
    item('Finance').focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle();
    await userEvent.keyboard('{Enter}');
    await settle();
    expect(host.selected()).toEqual(['invoices']);
    expect(item('Invoices').getAttribute('aria-selected')).toBe('true');

    await userEvent.click(item('Read me'));
    await settle();
    expect(host.selected()).toEqual(['readme']);

    const legalGroup = item('Legal').querySelector('[role="group"]')!;
    expect(getComputedStyle(legalGroup).display).toBe('none');
  });
});
