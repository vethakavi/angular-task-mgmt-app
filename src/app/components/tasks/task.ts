import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task',
  templateUrl: './task.html',
  styleUrl: './task.css',
  imports: [RouterLink, CommonModule, FormsModule],
})
export class Task implements OnInit {
  taskService = inject(TaskService);
  userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  readonly currentUser = this.userService.user;
  tasks$!: Observable<any>;
  tasks: any[] = [];

  // UI state
  userDropdownOpen = false;

  // Edit state
  editingTaskId: string | null = null;
  editingTitle = '';
  editingStatus = 'todo';
  editingPriority = 'low';
  editingCompleted = false;
  editStatusMessage = '';

  // Delete state
  deletingTaskId: string | null = null;
  deleteStatusMessage = '';

  hasLoaded: boolean = false;

  token: string | null = null;

  ngOnInit() {
    this.userService.loadSession();
    this.token = this.userService.getToken();
    if (!this.token) {
      this.router.navigate(['/']);
      return;
    }
    this.loadTasks();
  }

  toggleUserMenu() {
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  logout() {
    this.userDropdownOpen = false;
    this.userService.clearSession();
    this.router.navigate(['/']);
  }

  loadTasks() {
    this.hasLoaded = false;
    if (this.token) {
      this.tasks$ = this.taskService.getTasks(this.token);
      this.tasks$.subscribe((tasks) => {
        this.tasks = tasks;
        this.hasLoaded = true;
        this.cdr.markForCheck();
      });
    }
  }

  startEdit(task: any) {
    this.editingTaskId = task._id;
    this.editingTitle = task.title;
    this.editingStatus = task.status || 'todo';
    this.editingPriority = task.priority || 'low';
    this.editingCompleted = task.completed;
    this.editStatusMessage = '';
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editingTitle = '';
    this.editingStatus = 'todo';
    this.editingPriority = 'low';
    this.editingCompleted = false;
    this.editStatusMessage = '';
  }

  saveEdit() {
    if (!this.editingTitle.trim()) {
      this.editStatusMessage = '✗ Task title cannot be empty.';
      this.clearMessageAfterDelay('edit', 3000);
      return;
    }

    if (!this.token || !this.editingTaskId) {
      return;
    }

    this.editStatusMessage = 'Updating...';
    const payload = {
      title: this.editingTitle,
      status: this.editingStatus,
      priority: this.editingPriority,
      completed: this.editingCompleted,
    };

    this.taskService.updateTask(this.token, this.editingTaskId, payload).subscribe({
      next: (res) => {
        this.editStatusMessage = '✓ Task updated successfully!';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.loadTasks();
          this.cancelEdit();
        }, 500);
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.editStatusMessage = '✗ Failed to update task.';
        this.clearMessageAfterDelay('edit', 3000);
      },
    });
  }

  startDelete(taskId: string) {
    this.deletingTaskId = taskId;
    this.deleteStatusMessage = '';
  }

  cancelDelete() {
    this.deletingTaskId = null;
    this.deleteStatusMessage = '';
  }

  confirmDelete() {
    if (!this.token || !this.deletingTaskId) {
      return;
    }

    this.deleteStatusMessage = 'Deleting...';
    this.taskService.deleteTask(this.token, this.deletingTaskId).subscribe({
      next: (res) => {
        this.deleteStatusMessage = '✓ Task deleted successfully!';
        this.cdr.markForCheck();
        setTimeout(() => {
          this.loadTasks();
          this.cancelDelete();
        }, 500);
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.deleteStatusMessage = '✗ Failed to delete task.';
        this.clearMessageAfterDelay('delete', 3000);
      },
    });
  }

  private clearMessageAfterDelay(type: 'edit' | 'delete', delayMs: number) {
    setTimeout(() => {
      if (type === 'edit') {
        this.editStatusMessage = '';
      } else {
        this.deleteStatusMessage = '';
      }
      this.cdr.markForCheck();
    }, delayMs);
  }
}
