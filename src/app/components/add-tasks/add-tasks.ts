import { Component, inject, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { UserService } from '../../services/user.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-tasks',
  templateUrl: './add-tasks.html',
  styleUrl: './add-tasks.css',
  imports: [RouterLink, CommonModule, FormsModule],
})
export class AddTasks implements OnInit {
  taskService = inject(TaskService);
  userService = inject(UserService);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);
  statusMessage = '';
  selectedStatus: string = 'todo';
  selectedPriority: string = 'low';
  @ViewChild('form') form: ElementRef | null = null;

  ngOnInit() {}

  addTask(title: string, status: string, priority: string) {
    // Validation
    if (!title.trim()) {
      this.statusMessage = 'Please enter a task title.';
      this.cdr.detectChanges();
      this.clearMessageAfterDelay(3000);
      return;
    }

    const token = this.userService.getToken();
    if (!token) {
      this.statusMessage = 'Session expired. Redirecting to login...';
      this.cdr.detectChanges();
      setTimeout(() => this.router.navigate(['/']), 800);
      return;
    }

    const payload = { title, status, priority };
    this.statusMessage = 'Adding task...';
    this.cdr.detectChanges();

    this.taskService.createTask(token, payload).subscribe({
      next: (res) => {
        this.statusMessage = '✓ Task added successfully!';
        this.cdr.detectChanges();

        // Reset form
        if (this.form) {
          this.form.nativeElement.reset();
        }
        this.selectedStatus = 'todo';
        this.selectedPriority = 'low';

        // Clear message after 2 seconds
        this.clearMessageAfterDelay(2000);
      },
      error: (err) => {
        this.statusMessage = '✗ Failed to add task. Please try again.';
        this.cdr.detectChanges();
        console.error('createTask error', err);
        this.clearMessageAfterDelay(3000);
      },
    });
  }

  private clearMessageAfterDelay(delayMs: number) {
    setTimeout(() => {
      this.statusMessage = '';
      this.cdr.detectChanges();
    }, delayMs);
  }
}
