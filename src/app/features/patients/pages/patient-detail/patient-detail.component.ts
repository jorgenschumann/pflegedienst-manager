import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { PatientStateService } from '../../services/patient-state.service';
import {
  checkInteractions,
  Contact,
  InteractionSeverity,
  INTERACTION_SEVERITY_LABELS,
  MdkAssessment,
  MDK_STATUS_LABELS,
  MedicationAdministrationStatus,
  MedicationForm,
  MedicationTime,
  MEDICATION_ADMINISTRATION_STATUS_LABELS,
  MEDICATION_FORM_LABELS,
  MEDICATION_TIME_LABELS,
  Pflegegrad,
  POWER_OF_ATTORNEY_LABELS,
  PowerOfAttorneyType,
  RiskAssessment,
  RISK_ASSESSMENT_LABELS,
  SIS_THEMENFELD_LABELS,
  SisThemenfeldCode
} from '../../models';
import { MedicationFormComponent } from '../medication-form/medication-form.component';
import { MedicationAdministrationComponent } from '../medication-administration/medication-administration.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { MdkAssessmentFormComponent } from '../mdk-assessment-form/mdk-assessment-form.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    CardModule,
    TabsModule,
    TagModule,
    TableModule,
    DialogModule,
    TooltipModule,
    TextareaModule,
    SelectModule,
    FormsModule,
    MedicationFormComponent,
    MedicationAdministrationComponent,
    ContactFormComponent,
    MdkAssessmentFormComponent
  ],
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
  readonly medications = computed(() => this.patientState.getMedications(this.patientId()));
  readonly activeMedications = computed(() => this.medications().filter((m) => m.active));
  readonly discontinuedMedications = computed(() => this.medications().filter((m) => !m.active));
  readonly interactionWarnings = computed(() => checkInteractions(this.medications()));
  readonly administrations = computed(() => this.patientState.getMedicationAdministrations(this.patientId()));
  readonly pflegegradHistory = computed(() => this.patientState.getPflegegradHistory(this.patientId()));
  readonly mdkAssessments = computed(() => this.patientState.getMdkAssessments(this.patientId()));
  readonly contacts = computed(() => this.patientState.getContacts(this.patientId()));

  readonly themenfeldLabels = SIS_THEMENFELD_LABELS;
  readonly riskLabels = RISK_ASSESSMENT_LABELS;
  readonly mdkStatusLabels = MDK_STATUS_LABELS;
  readonly poaLabels = POWER_OF_ATTORNEY_LABELS;
  readonly interactionSeverityLabels = INTERACTION_SEVERITY_LABELS;

  readonly medicationDialogVisible = signal(false);
  readonly administrationDialogVisible = signal(false);
  readonly bmpImportMessage = signal<string | null>(null);
  readonly contactDialogVisible = signal(false);
  readonly editingContact = signal<Contact | null>(null);
  readonly mdkDialogVisible = signal(false);
  readonly completeDialogVisible = signal(false);
  readonly completingAssessment = signal<MdkAssessment | null>(null);
  readonly completeResultGrad = signal<Pflegegrad>(2);
  readonly pflegegradOptions = [0, 1, 2, 3, 4, 5].map((g) => ({
    label: g === 0 ? 'Kein Pflegegrad' : `Pflegegrad ${g}`,
    value: g as Pflegegrad
  }));

  medicationFormLabel(form: MedicationForm): string {
    return MEDICATION_FORM_LABELS[form];
  }

  medicationTimeLabel(time: MedicationTime): string {
    return MEDICATION_TIME_LABELS[time];
  }

  administrationStatusLabel(status: MedicationAdministrationStatus): string {
    return MEDICATION_ADMINISTRATION_STATUS_LABELS[status];
  }

  private medicationNameById(id: string): string {
    const med = this.medications().find((m) => m.id === id);
    return med ? `${med.name} (${med.dosage})` : 'Unbekannt';
  }

  medicationName(id: string): string {
    return this.medicationNameById(id);
  }

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

  mdkStatusSeverity(status: MdkAssessment['status']): 'success' | 'info' | 'danger' {
    if (status === 'DURCHGEFUEHRT') return 'success';
    if (status === 'ABGESAGT') return 'danger';
    return 'info';
  }

  mdkStatusLabel(status: MdkAssessment['status']): string {
    return this.mdkStatusLabels[status];
  }

  poaLabel(poa: PowerOfAttorneyType): string {
    return this.poaLabels[poa];
  }

  interactionSeverityLabel(severity: InteractionSeverity): string {
    return this.interactionSeverityLabels[severity];
  }

  interactionSeverityTagSeverity(severity: InteractionSeverity): 'danger' | 'warn' | 'info' {
    if (severity === 'HOCH') return 'danger';
    if (severity === 'MITTEL') return 'warn';
    return 'info';
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

  openNewMedication(): void {
    this.medicationDialogVisible.set(true);
  }

  openNewAdministration(): void {
    this.administrationDialogVisible.set(true);
  }

  discontinueMedication(id: string): void {
    this.patientState.discontinueMedication(id);
  }

  isRenewalDue(medicationId: string): boolean {
    const med = this.medications().find((m) => m.id === medicationId);
    return !!med && this.patientState.isRenewalDue(med);
  }

  importFromBmp(): void {
    const count = this.patientState.importFromBmp(this.patientId());
    this.bmpImportMessage.set(
      count > 0 ? `${count} Medikament(e) aus dem BMP übernommen.` : 'Keine neuen Medikamente im BMP gefunden.'
    );
  }

  administrationStatusSeverity(status: MedicationAdministrationStatus): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'GEGEBEN':
        return 'success';
      case 'VERWEIGERT':
        return 'danger';
      default:
        return 'warn';
    }
  }

  // ---- Angehörige & Vollmachten ----
  openNewContact(): void {
    this.editingContact.set(null);
    this.contactDialogVisible.set(true);
  }

  editContact(contact: Contact): void {
    this.editingContact.set(contact);
    this.contactDialogVisible.set(true);
  }

  removeContact(id: string): void {
    this.patientState.removeContact(id);
  }

  closeContactDialog(): void {
    this.contactDialogVisible.set(false);
    this.editingContact.set(null);
  }

  // ---- Pflegegrad & MD-Begutachtung ----
  openNewMdkAssessment(): void {
    this.mdkDialogVisible.set(true);
  }

  cancelMdkAssessment(id: string): void {
    this.patientState.cancelMdkAssessment(id);
  }

  openCompleteDialog(assessment: MdkAssessment): void {
    this.completingAssessment.set(assessment);
    this.completeResultGrad.set(this.patient()?.pflegegrad ?? 2);
    this.completeDialogVisible.set(true);
  }

  confirmCompleteAssessment(): void {
    const assessment = this.completingAssessment();
    if (!assessment) return;
    this.patientState.completeMdkAssessment(assessment.id, this.completeResultGrad());
    this.completeDialogVisible.set(false);
    this.completingAssessment.set(null);
  }

  goBack(): void {
    this.router.navigate(['/patienten']);
  }
}

