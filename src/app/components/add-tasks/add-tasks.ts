import { Component, inject, ViewChild, ElementRef, signal } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateTask } from '../../models/tasks-model';
import { take } from 'rxjs';

@Component({
  selector: 'app-add-tasks',
  templateUrl: './add-tasks.html',
  styleUrl: './add-tasks.css',
  imports: [RouterLink, CommonModule, FormsModule],
})
export class AddTasks {
  taskService = inject(TaskService);
  statusMessage = signal('');
  selectedStatus = signal('todo');
  selectedPriority = signal('low');
  @ViewChild('form') form: ElementRef | null = null;

  addTask(title: string, status: string, priority: string) {
    if (!title.trim()) {
      this.statusMessage.set('Please enter a task title.');
      this.clearMessageAfterDelay(3000);
      return;
    }

    const payload = { title, status, priority };
    this.statusMessage.set('Adding task...');

    this.taskService
      .createTask(payload as CreateTask)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.statusMessage.set('✓ Task added successfully!');
          if (this.form) {
            this.form.nativeElement.reset();
          }
          this.selectedStatus.set('todo');
          this.selectedPriority.set('low');
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
