<?php
namespace App\Http\Controllers\Api\Employee;

use App\Http\Controllers\Controller;
use App\Models\{Employee, EmployeeDocument};
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Employee $employee)
    {
        return $this->success($employee->documents()->latest()->get());
    }

    public function store(Request $request, Employee $employee)
    {
        $request->validate([
            'document_type' => 'required|string',
            'document_name' => 'required|string',
            'file'          => 'required|file|max:10240',
            'issue_date'    => 'nullable|date',
            'expiry_date'   => 'nullable|date|after:issue_date',
        ]);

        $path = $request->file('file')->store("employees/{$employee->id}/documents", 'public');

        $doc = $employee->documents()->create([
            'document_type' => $request->document_type,
            'document_name' => $request->document_name,
            'file_path'     => $path,
            'issue_date'    => $request->issue_date,
            'expiry_date'   => $request->expiry_date,
            'uploaded_by'   => auth()->id(),
        ]);

        return $this->success($doc, 'Document uploaded', 201);
    }

    public function destroy(Employee $employee, EmployeeDocument $document)
    {
        $document->delete();
        return $this->success(null, 'Document deleted');
    }
}
