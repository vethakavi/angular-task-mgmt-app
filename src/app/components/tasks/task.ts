import { Component, inject, OnInit, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Tasks } from '../../models/tasks-model';
import { take } from 'rxjs';

@Component({
  selector: 'app-task',
  templateUrl: './task.html',
  styleUrl: './task.css',
  imports: [RouterLink, CommonModule, FormsModule],
})
export class Task implements OnInit {
  taskService = inject(TaskService);
  userService = inject(UserService);
  private router = inject(Router);
  readonly currentUser = this.userService.user;

  tasks = signal<Tasks[]>([]);
  userDropdownOpen = signal(false);
  editingTaskId = signal<string | null>(null);

  editingTitle = signal('');
  editingStatus = signal<'todo' | 'inprogress' | 'completed'>('todo');
  editingPriority = signal<'low' | 'medium' | 'high'>('low');
  editStatusMessage = signal('');

  deletingTaskId = signal<string | null>(null);
  deleteStatusMessage = signal('');

  hasLoaded = signal(false);

  ngOnInit() {
    this.userService.loadSession();
    this.loadTasks();
  }

  toggleUserMenu() {
    this.userDropdownOpen.update((open) => !open);
  }

  logout() {
    this.userDropdownOpen.set(false);
    this.userService.clearSession();
    this.router.navigate(['/']);
  }

  loadTasks(): void {
    this.hasLoaded.set(false);

    this.taskService
      .getTasks()
      .pipe(take(1))
      .subscribe({
        next: (tasks: Tasks[]) => {
          this.tasks.set(tasks);
          this.hasLoaded.set(true);
        },
        error: (err: unknown) => {
          console.error('Failed to load tasks:', err);
          this.hasLoaded.set(true);
        },
      });
  }

  startEdit(task: Tasks): void {
    this.editingTaskId.set(task._id);
    this.editingTitle.set(task.title);
    this.editingStatus.set(task.status || 'todo');
    this.editingPriority.set(task.priority || 'low');
    this.editStatusMessage.set('');
  }

  cancelEdit() {
    this.editingTaskId.set(null);
    this.editingTitle.set('');
    this.editingStatus.set('todo');
    this.editingPriority.set('low');
    this.editStatusMessage.set('');
  }

  saveEdit() {
    const editingTaskId = this.editingTaskId();
    const title = this.editingTitle();

    if (!title.trim()) {
      this.editStatusMessage.set('✗ Task title cannot be empty.');
      this.clearMessageAfterDelay('edit', 3000);
      return;
    }

    if (!editingTaskId) {
      return;
    }

    this.editStatusMessage.set('Updating...');
    const payload = {
      title,
      status: this.editingStatus(),
      priority: this.editingPriority(),
    };

    this.taskService
      .updateTask(editingTaskId, payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.editStatusMessage.set('✓ Task updated successfully!');
          setTimeout(() => {
            this.loadTasks();
            this.cancelEdit();
          }, 500);
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.editStatusMessage.set('✗ Failed to update task.');
          this.clearMessageAfterDelay('edit', 3000);
        },
      });
  }

  startDelete(taskId: string) {
    this.deletingTaskId.set(taskId);
    this.deleteStatusMessage.set('');
  }

  cancelDelete() {
    this.deletingTaskId.set(null);
    this.deleteStatusMessage.set('');
  }

  confirmDelete() {
    const deletingTaskId = this.deletingTaskId();

    if (!deletingTaskId) {
      return;
    }

    this.deleteStatusMessage.set('Deleting...');
    this.taskService
      .deleteTask(deletingTaskId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleteStatusMessage.set('✓ Task deleted successfully!');
          setTimeout(() => {
            this.loadTasks();
            this.cancelDelete();
          }, 500);
        },
        error: (err) => {
          console.error('Delete failed:', err);
          this.deleteStatusMessage.set('✗ Failed to delete task.');
          this.clearMessageAfterDelay('delete', 3000);
        },
      });
  }

  private clearMessageAfterDelay(type: 'edit' | 'delete', delayMs: number) {
    setTimeout(() => {
      if (type === 'edit') {
        this.editStatusMessage.set('');
      } else {
        this.deleteStatusMessage.set('');
      }
    }, delayMs);
  }
}
