import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTasks } from './add-tasks';

describe('AddTasks', () => {
  let component: AddTasks;
  let fixture: ComponentFixture<AddTasks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTasks],
    }).compileComponents();

    fixture = TestBed.createComponent(AddTasks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate task title is not empty', () => {
    component.addTask('', '', '');
    expect(component.statusMessage).toContain('task title');
  });

  it('should set adding status on task submission', () => {
    localStorage.setItem('token', 'test-token');
    component.addTask('Test Task', 'status', 'priority');
    expect(component.statusMessage).toBe('Adding task...');
  });
});
