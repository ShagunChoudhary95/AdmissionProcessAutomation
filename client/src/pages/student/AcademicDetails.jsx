import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { FormField, Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services';
import toast from 'react-hot-toast';

const qualSchema = z.object({
  level: z.string().min(1, 'Level required'),
  board: z.string().min(2, 'Board/University required'),
  schoolCollege: z.string().min(2, 'School/College name required'),
  yearOfPassing: z.string().regex(/^\d{4}$/, 'Enter valid year'),
  marksType: z.string().min(1, 'Select marks type'),
  marks: z.string().refine(v => !isNaN(Number(v)) && Number(v) > 0, 'Enter valid marks/percentage'),
  maxMarks: z.string().optional(),
  subjects: z.string().optional(),
  rollNumber: z.string().optional(),
});

const schema = z.object({
  qualifications: z.array(qualSchema).min(1),
  hasEntranceExam: z.boolean().optional(),
  entranceExamName: z.string().optional(),
  entranceExamRollNo: z.string().optional(),
  entranceExamScore: z.string().optional(),
  entranceExamRank: z.string().optional(),
  hasGap: z.boolean().optional(),
  gapReason: z.string().optional(),
});

export default function AcademicDetails() {
  const navigate = useNavigate();
  const { register, control, watch, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      qualifications: [
        { level: '10th', board: '', schoolCollege: '', yearOfPassing: '', marksType: 'Percentage', marks: '', maxMarks: '100' },
        { level: '12th', board: '', schoolCollege: '', yearOfPassing: '', marksType: 'Percentage', marks: '', maxMarks: '100' },
      ],
      hasEntranceExam: false,
      hasGap: false,
    },
  });

  useEffect(() => {
    studentService.getProfile().then((res) => {
      const acad = res.data.profile?.academic;
      if (acad?.qualifications?.length) {
        reset({
          ...acad,
          qualifications: acad.qualifications.map((q) => ({ ...q, marks: String(q.marks), maxMarks: String(q.maxMarks || 100) })),
          entranceExamScore: acad.entranceExamScore != null ? String(acad.entranceExamScore) : '',
          entranceExamRank: acad.entranceExamRank != null ? String(acad.entranceExamRank) : '',
        });
      }
    }).catch(() => {});
  }, [reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'qualifications' });
  const hasEntrance = watch('hasEntranceExam');
  const hasGap = watch('hasGap');

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        qualifications: data.qualifications.map((q) => ({
          ...q,
          marks: Number(q.marks),
          maxMarks: Number(q.maxMarks || 100),
        })),
        entranceExamScore: data.entranceExamScore ? Number(data.entranceExamScore) : undefined,
        entranceExamRank: data.entranceExamRank ? Number(data.entranceExamRank) : undefined,
      };
      await studentService.updateAcademic(payload);
      toast.success('Academic details saved successfully.');
      navigate('/student/courses');
    } catch {
      toast.error('Failed to save. Please try again.');
    }
  };

  return (
    <DashboardLayout role="student">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-5">
        <div className="mb-2">
          <h2 className="text-lg font-bold text-slate-800">Academic Details</h2>
          <p className="text-sm text-slate-500">Enter your academic qualifications. Marks will be used for eligibility and merit calculation.</p>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Qualifications</CardTitle>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => append({ level: 'Graduation', board: '', schoolCollege: '', yearOfPassing: '', marksType: 'Percentage', marks: '', maxMarks: '100' })}
            >
              Add Qualification
            </Button>
          </CardHeader>
          <CardBody className="space-y-6">
            {fields.map((field, i) => (
              <div key={field.id} className="p-4 border border-slate-200 rounded-lg space-y-4 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-slate-700">Qualification {i + 1}</h4>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Level" required error={errors.qualifications?.[i]?.level?.message}>
                    <Select {...register(`qualifications.${i}.level`)} error={errors.qualifications?.[i]?.level?.message}>
                      <option value="">Select level</option>
                      <option>10th</option><option>12th</option><option>Diploma</option>
                      <option>Graduation</option><option>Post-Graduation</option>
                    </Select>
                  </FormField>
                  <FormField label="Board / University" required error={errors.qualifications?.[i]?.board?.message}>
                    <Input placeholder="e.g. CBSE, MPBSE, RTU" {...register(`qualifications.${i}.board`)} error={errors.qualifications?.[i]?.board?.message} />
                  </FormField>
                  <FormField label="School / College" required error={errors.qualifications?.[i]?.schoolCollege?.message} className="sm:col-span-2">
                    <Input placeholder="Name of institution" {...register(`qualifications.${i}.schoolCollege`)} error={errors.qualifications?.[i]?.schoolCollege?.message} />
                  </FormField>
                  <FormField label="Year of Passing" required error={errors.qualifications?.[i]?.yearOfPassing?.message}>
                    <Input placeholder="YYYY" maxLength={4} {...register(`qualifications.${i}.yearOfPassing`)} error={errors.qualifications?.[i]?.yearOfPassing?.message} />
                  </FormField>
                  <FormField label="Roll Number" error={errors.qualifications?.[i]?.rollNumber?.message}>
                    <Input placeholder="Exam roll number" {...register(`qualifications.${i}.rollNumber`)} />
                  </FormField>
                  <FormField label="Marks Type" required error={errors.qualifications?.[i]?.marksType?.message}>
                    <Select {...register(`qualifications.${i}.marksType`)}>
                      <option>Percentage</option><option>CGPA</option><option>Marks</option>
                    </Select>
                  </FormField>
                  <FormField label="Marks / Percentage" required error={errors.qualifications?.[i]?.marks?.message}>
                    <Input type="number" step="0.01" placeholder="e.g. 85.50" {...register(`qualifications.${i}.marks`)} error={errors.qualifications?.[i]?.marks?.message} />
                  </FormField>
                  <FormField label="Subjects (comma-separated)" className="sm:col-span-2">
                    <Input placeholder="e.g. Physics, Chemistry, Mathematics" {...register(`qualifications.${i}.subjects`)} />
                  </FormField>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Entrance exam */}
        <Card>
          <CardHeader><CardTitle>Entrance Examination</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="hasEntrance" {...register('hasEntranceExam')} className="w-4 h-4 text-blue-700 rounded border-slate-300" />
              <label htmlFor="hasEntrance" className="text-sm text-slate-700">I have appeared in an entrance examination</label>
            </div>
            {hasEntrance && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <FormField label="Entrance Exam Name">
                  <Input placeholder="e.g. JEE Main, CUET, MAT" {...register('entranceExamName')} />
                </FormField>
                <FormField label="Roll Number">
                  <Input placeholder="Exam roll number" {...register('entranceExamRollNo')} />
                </FormField>
                <FormField label="Score / Marks">
                  <Input type="number" step="0.01" placeholder="Score obtained" {...register('entranceExamScore')} />
                </FormField>
                <FormField label="Rank (if applicable)">
                  <Input type="number" placeholder="All-India rank" {...register('entranceExamRank')} />
                </FormField>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Gap year */}
        <Card>
          <CardHeader><CardTitle>Gap / Break in Education</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="hasGap" {...register('hasGap')} className="w-4 h-4 text-blue-700 rounded border-slate-300" />
              <label htmlFor="hasGap" className="text-sm text-slate-700">I had a gap/break in my education</label>
            </div>
            {hasGap && (
              <FormField label="Reason for Gap">
                <textarea {...register('gapReason')} rows={3} placeholder="Briefly explain the reason for the gap in your education" className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </FormField>
            )}
          </CardBody>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/student/profile')}>Back</Button>
            <Button type="submit" loading={isSubmitting}>Save & Continue</Button>
          </CardFooter>
        </Card>
      </form>
    </DashboardLayout>
  );
}

