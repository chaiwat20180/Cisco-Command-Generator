$(document).ready(function() {
    $('#currentYear').text(`2024 - ${new Date().getFullYear()}`);
    let vlanNames = []; // ตัวแปรเพื่อเก็บชื่อ VLAN

    $('#vlanCount').on('input', function() {
        const count = $(this).val();
        $('#vlanInputs').empty();
        vlanNames = [];
        $('#vlanSelect').empty(); 

        for (let i = 1; i <= count; i++) {
            $('#vlanInputs').append(`
                <div class="vlan-input mt-4">
                    <h5>VLAN ${i}</h5>
                    <div class="form-group">
                        <label for="vlanName${i}">ชื่อ VLAN:</label>
                        <input type="text" class="form-control" id="vlanName${i}" placeholder="Vlan Name">
                    </div>
                    <div class="form-group">
                        <label for="vlanIp${i}">IP Address:</label>
                        <input type="text" class="form-control" id="vlanIp${i}" placeholder="(Sample -> 192.168.1.254 255.255.255.0)">
                    </div>
                    <div class="form-group">
                        <label for="ipHelper${i}">IP Helper:</label>
                        <input type="text" class="form-control" id="ipHelper${i}" placeholder="(Sample -> 192.168.1.3)">
                    </div>
                </div>
            `);
        }

        // อัปเดต dropdown เมื่อกรอกชื่อ VLAN
        $('input[id^="vlanName"]').on('input', function() {
            vlanNames = []; // เคลียร์ชื่อ VLAN เก่า
            $('input[id^="vlanName"]').each(function() {
                const vlanName = $(this).val();
                if (vlanName) {
                    vlanNames.push(vlanName);
                }
            });
            // อัปเดต dropdown
            $('#vlanSelect').empty();
            vlanNames.forEach(function(name) {
                $('#vlanSelect').append(`<option value="${name}">${name}</option>`);
            });
        });
    });

    $('#generateBtn').click(function() {
        let commands = 'configure terminal\n';
        const vlanCount = $('#vlanCount').val();
        const portAccess = $('#portAccess').val();
        const interfaceRange = $('#interfaceRange').val();

        if (!vlanCount || !portAccess && !interfaceRange) {
            Swal.fire({
                title: 'Error',
                text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
        else{
            // สร้าง VLAN และ IP Address
            for (let i = 1; i <= vlanCount; i++) {
                const vlanName = $(`#vlanName${i}`).val();
                const vlanIp = $(`#vlanIp${i}`).val();
                const ipHelper = $(`#ipHelper${i}`).val();
                if (vlanName && vlanIp) {
                    commands += `vlan ${vlanName}\n`;
                    commands += `exit\n`;
                    commands += `interface vlan ${vlanName}\n`;
                    commands += `ip address ${vlanIp}\n`;
                    if (ipHelper) {
                        commands += `ip helper-address ${ipHelper}\n`;
                    }
                    commands += `exit\n`;
                    vlanNames.push(vlanName); 
                }
            }

            // สร้าง Access Port และ Interface Range
            const portAccessType = $('#portAccessType').val();
            //const portAccess = $('#portAccess').val();
            const isTrunk = $('#PortTrunk').is(':checked');
            const isTrunkRange = $('#PortTrunkRange').is(':checked');
            const interfaceRangeType = $('#interfaceRangeType').val();
            //const interfaceRange = $('#interfaceRange').val();

            if (interfaceRange) {
                commands += `interface range ${interfaceRangeType} ${interfaceRange}\n`;
                if (isTrunkRange) {
                    commands += `switchport trunk encapsulation dot1q\n`;
                    commands += `switchport mode trunk\n`;
                }
                else{
                    commands += `switchport mode access\n`;
                    commands += `switchport access vlan ${$('#vlanSelect').val()}\n`; 
                }
                commands += `shutdown\nno shutdown\n`;
            } else if (portAccess) {
                commands += `interface ${portAccessType} ${portAccess}\n`;
                if (isTrunk) {
                    commands += `switchport trunk encapsulation dot1q\n`;
                    commands += `switchport mode trunk\n`;
                } else {
                    commands += `switchport mode access\n`;
                    commands += `switchport access vlan ${$('#vlanSelect').val()}\n`; 
                }
                commands += `shutdown\nno shutdown\n`;
            }

            commands += `end\nwrite memory\ncopy running-config startup-config\n\n`;

            if (commands) {
                $('#output').val(commands);
            } else {
                Swal.fire({
                    title: 'Error',
                    text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        }
    });

    $('#showDetailSubnet').click(function(){
        Swal.fire({
            title: "Subnet Detail",
            html: `
                    <img src="https://cdn.discordapp.com/attachments/1251812454699237417/1338810395292598292/class_a_subnets.png?ex=67ac6fd8&is=67ab1e58&hm=e90928390e85d8d38c11c166b4ad87812ff6be6de706221cb77213a0c8c9e34f&" style="width: 100%; height: auto;">
                    <h2 class="mt-4 text-center">IP Calculator</h2>
                    <img src="https://cdn.discordapp.com/attachments/1251812454699237417/1338812677627056128/images.png?ex=67ac71f8&is=67ab2078&hm=97dd8a4343a9e4fbaf2df7453b7cb4bb26f6dfdc28e1fa8097e4bcb1e1b6f1fc&" style="width: 100%; height: auto;">
            `,
            icon: "info"
        });
    });
    $('#showDetailTrunk').click(function(){
        Swal.fire({
            html: `
                <div class="text-center mb-3 wave-text">
                    <h1>Trunk Detail</h1>
                </div>
                <hr>
                <div class="text-center mb-3">
                    <h5>สำหรับ Switch L2</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered bg-primary" style="font-size:0.6rem;">
                        <thead>
                            <tr>
                                <th style="width: 150px;">Command</th>
                                <th style="width: 150px;">คำอธิบาย</th>
                                <th style="width: 200px;">ตัวอย่าง</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>switchport mode trunk</td>
                                <td>คำสั่งนี้ใช้ได้ทั้ง Swithc L2&L3</td>
                                <td class="text-start">
                                    interface gi 0/1 <br>
                                    switchport mode trunk<br>
                                    shutdown<br>
                                    no shutdown<br>
                                    end
                                </td>
                            </tr>
                            <tr>
                                <td>switchport trunk allowed vlan .....</td>
                                <td>คำสั่งนี้ใช้ได้ทั้ง Swithc L2&L3 ใช้ในการจ่าย Vlan ไปยัง Switch ที่เชื่อมต่อ</td>
                                <td class="text-start">
                                    interface gi 0/1 <br>
                                    switchport mode trunk<br>
                                    switchport trunk allowed vlan 10,20,30<br>
                                    shutdown<br>
                                    no shutdown<br>
                                    end
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="text-center mb-3">
                    <h5>สำหรับ Switch L3</h5>
                </div>
                <div class="table-responsive">
                    <table class="table table-bordered bg-primary" style="font-size:0.6rem;">
                        <thead>
                            <tr>
                                <th style="width: 150px;">Command</th>
                                <th style="width: 150px;">คำอธิบาย</th>
                                <th style="width: 200px;">ตัวอย่าง</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>switchport trunk encapsulation dot1q</td>
                                <td>คำสั่งนี้ใช้ได้แค่ Swithc L3 เท่านั้น</td>
                                <td class="text-start">
                                    interface gi 0/1 <br>
                                    switchport trunk encapsulation dot1q<br>
                                    switchport mode trunk<br>
                                    shutdown<br>
                                    no shutdown<br>
                                    end
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `,
            icon: "info"
        });
    });
});

// ฟังก์ชัน copy_data ที่อยู่นอก $(document).ready()
function copy_data() {
    const textArea = $("#output");
    const tempElement = $("<textarea></textarea>").val(textArea.val());
    
    $("body").append(tempElement);
    tempElement.select();
    
    navigator.clipboard.writeText(tempElement.val()).then(() => {
        Swal.fire({
            title: 'Success!',
            text: 'Copy success!',
            icon: 'success',
            timer: 1500,
            confirmButtonText: 'OK'
        });
    }).catch(err => {
        console.error("Failed to copy:", err);
        Swal.fire({
            title: 'Error!',
            text: 'Copy Failed. Please try again or CTRL+F5 and try again.',
            icon: 'error',
            timer: 1500,
            confirmButtonText: 'OK'
        });
    }).finally(() => {
        tempElement.remove();
    });
}
