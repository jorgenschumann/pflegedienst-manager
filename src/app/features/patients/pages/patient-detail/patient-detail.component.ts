import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../../services/patient-state.service';
import {
  RiskAssessment,
  RISK_ASSESSMENT_LABELS,
  SIS_THEMENFELD_LABELS,
  SisThemenfeldCode
} from '../../models';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [DatePipe, ButtonModule, CardModule, TabsModule, TagModule, TextareaModule, FormsModule],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly patientState = inject(PatientStateService);

  private readonly patientId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('id') ?? '' }
  );

  readonly patient = computed(() => this.patientState.getPatient(this.patientId()));
  readonly sisRecord = computed(() => this.patientState.getSisRecord(this.patientId()));
  readonly riskAssessments = computed(() => this.patientState.getRiskAssessments(this.patientId()));

  readonly themenfeldLabels = SIS_THEMENFELD_LABELS;
  readonly riskLabels = RISK_ASSESSMENT_LABELS;

  pflegegradSeverity(grad: number): 'success' | 'info' | 'warn' | 'danger' {
    if (grad <= 1) return 'success';
    if (grad <= 3) return 'info';
    if (grad === 4) return 'warn';
    return 'danger';
  }

  riskSeverity(level: string): 'success' | 'warn' | 'danger' {
    if (level === 'HOCH') return 'danger';
    if (level === 'MITTEL') return 'warn';
    return 'success';
  }

  age(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  updateThemenfeldText(code: SisThemenfeldCode, text: string): void {
    const record = this.sisRecord();
    if (!record) return;
    this.patientState.upsertSisRecord({
      ...record,
      themenfelder: record.themenfelder.map((tf) => (tf.code === code ? { ...tf, text } : tf)),
      lastUpdatedAt: new Date().toISOString().slice(0, 10)
    });
  }

  updateBiografie(text: string): void {
    const record = this.sisRecord();
    if (!record) return;
    this.patientState.upsertSisRecord({
      ...record,
      biografieNotizen: text,
      lastUpdatedAt: new Date().toISOString().slice(0, 10)
    });
  }

  reassess(assessment: RiskAssessment): void {
    this.patientState.upsertRiskAssessment({
      ...assessment,
      assessedAt: new Date().toISOString().slice(0, 10),
      nextAssessmentDate: this.addDays(new Date(), 30)
    });
  }

  private addDays(date: Date, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  goBack(): void {
    this.router.navigate(['/patienten']);
  }
}
