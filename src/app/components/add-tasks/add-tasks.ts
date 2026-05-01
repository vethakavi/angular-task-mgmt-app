import { Component, inject, ViewChild, ElementRef, signal, DestroyRef } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CreateTask } from '../../models/tasks-model';

@Component({
  selector: 'app-add-tasks',
  templateUrl: './add-tasks.html',
  styleUrl: './add-tasks.css',
  imports: [RouterLink, CommonModule, FormsModule],
})
export class AddTasks {
  taskService = inject(TaskService);
  userService = inject(UserService);
  router = inject(Router);
  private destroyRef = inject(DestroyRef);
  statusMessage = signal('');
  selectedStatus = signal('todo');
  selectedPriority = signal('low');
  @ViewChild('form') form: ElementRef | null = null;

  addTask(title: string, status: string, priority: string) {
    // Validation
    if (!title.trim()) {
      this.statusMessage.set('Please enter a task title.');
      this.clearMessageAfterDelay(3000);
      return;
    }

    const token = this.userService.getToken();
    if (!token) {
      this.statusMessage.set('Session expired. Redirecting to login...');
      setTimeout(() => this.router.navigate(['/']), 800);
      return;
    }

    const payload = { title, status, priority };
    this.statusMessage.set('Adding task...');

    this.taskService
      .createTask(payload as CreateTask)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.statusMessage.set('✓ Task added successfully!');
          // Reset form
          if (this.form) {
            this.form.nativeElement.reset();
          }
          this.selectedStatus.set('todo');
          this.selectedPriority.set('low');

          // Clear message after 2 seconds
          this.clearMessageAfterDelay(2000);
        },
        error: (err) => {
          this.statusMessage.set('✗ Failed to add task. Please try again.');
          console.error('createTask error', err);
          this.clearMessageAfterDelay(3000);
        },
      });
  }

  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage.set('');
    }, delayMs);
  }
}
