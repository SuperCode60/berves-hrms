<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Site, Department, JobTitle};

class SitesAndDepartmentsSeeder extends Seeder
{
    public function run(): void
    {
        $sites = [
            ['name'=>'Head Office','location'=>'Kumasi, Ghana','latitude'=>6.6884,'longitude'=>-1.6244,'geo_fence_radius_m'=>200,'is_active'=>true],
            ['name'=>'Mine Site Alpha','location'=>'Obuasi, Ghana','latitude'=>6.2038,'longitude'=>-1.6559,'geo_fence_radius_m'=>500,'is_active'=>true],
            ['name'=>'Mine Site Beta','location'=>'Tarkwa, Ghana','latitude'=>5.3008,'longitude'=>-1.9975,'geo_fence_radius_m'=>500,'is_active'=>true],
        ];
        foreach ($sites as $s) { Site::updateOrCreate(['name' => $s['name']], $s); }

        $departments = [
            ['name'=>'Human Resources'],
            ['name'=>'Engineering'],
            ['name'=>'Operations'],
            ['name'=>'Finance'],
            ['name'=>'Health & Safety'],
            ['name'=>'Information Technology'],
            ['name'=>'Administration'],
        ];
        foreach ($departments as $d) { Department::updateOrCreate(['name' => $d['name']], $d); }

        $titles = [
            ['title'=>'HR Manager','grade'=>'M3'],
            ['title'=>'HR Officer','grade'=>'S2'],
            ['title'=>'Senior Engineer','grade'=>'S4'],
            ['title'=>'Junior Engineer','grade'=>'S2'],
            ['title'=>'Site Supervisor','grade'=>'S3'],
            ['title'=>'Safety Officer','grade'=>'S2'],
            ['title'=>'Payroll Officer','grade'=>'S2'],
            ['title'=>'IT Administrator','grade'=>'S2'],
            ['title'=>'General Manager','grade'=>'M5'],
            ['title'=>'Finance Manager','grade'=>'M3'],
            ['title'=>'Operations Manager','grade'=>'M4'],
            ['title'=>'Machine Operator','grade'=>'T1'],
            ['title'=>'Driller','grade'=>'T2'],
            ['title'=>'Blaster','grade'=>'T3'],
        ];
        foreach ($titles as $t) { JobTitle::updateOrCreate(['title' => $t['title']], $t); }
    }
}
